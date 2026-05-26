<?php

namespace App\Models;

/**
 * Modèle Reinscription - dossier parent de réinscription
 */
class Reinscription extends BaseModel {
    protected static $table = 'reinscriptions';

    protected static $fillable = [
        'sourceUserId',
        'isGuest',
        'schoolYear',
        'requestType',
        'fullName',
        'email',
        'phone',
        'acceptedConditions',
        'notes',
        'status',
        'childrenCount'
    ];

    /**
     * Retourne les enfants liés au dossier
     */
    public function children() {
        if (!$this->id) {
            return [];
        }

        return ReinscriptionChild::where(['reinscriptionId' => $this->id]);
    }

    /**
     * Convertit le dossier en tableau avec ses enfants
     */
    public function toArray() {
        $array = parent::toArray();
        $array['children'] = array_map(function ($child) {
            return $child->toArray();
        }, $this->children());

        return $array;
    }

    /**
     * Retourne tous les dossiers avec leurs enfants
     */
    public static function allWithChildren(array $filters = []) {
        $db = self::connection();
        $sql = 'SELECT * FROM `' . static::$table . '`';
        $where = [];
        $params = [];

        foreach (['status', 'requestType', 'schoolYear', 'isGuest'] as $field) {
            if (!empty($filters[$field])) {
                $where[] = '`' . $field . '` = :' . $field;
                $params[$field] = $filters[$field];
            }
        }

        if (isset($filters['sourceUserId']) && $filters['sourceUserId'] !== null) {
            $where[] = '`sourceUserId` = :sourceUserId';
            $params['sourceUserId'] = (int) $filters['sourceUserId'];
        }

        if (!empty($where)) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }

        $sql .= ' ORDER BY `createdAt` DESC, `id` DESC';

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        return self::hydrateRowsWithChildren($rows);
    }

    /**
     * Retourne un dossier avec ses enfants
     */
    public static function findWithChildren($id) {
        $db = self::connection();
        $stmt = $db->prepare('SELECT * FROM `' . static::$table . '` WHERE `id` = ? LIMIT 1');
        $stmt->execute([(int) $id]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        $childrenMap = self::fetchChildrenMap([(int) $row['id']]);
        $row['children'] = $childrenMap[(int) $row['id']] ?? [];

        return $row;
    }

    /**
     * Crée un dossier de réinscription et ses enfants dans une transaction
     */
    public static function createWithChildren(array $parentData, array $childrenData) {
        $db = self::connection();
        $db->beginTransaction();

        try {
            $parentColumns = array_keys($parentData);
            $parentPlaceholders = array_map(static function ($column) {
                return ':' . $column;
            }, $parentColumns);

            $parentSql = 'INSERT INTO `' . static::$table . '` (`' . implode('`, `', $parentColumns) . '`) VALUES (' . implode(', ', $parentPlaceholders) . ')';
            $parentStmt = $db->prepare($parentSql);
            $parentStmt->execute($parentData);

            $reinscriptionId = (int) $db->lastInsertId();

            foreach ($childrenData as $childData) {
                $childData['reinscriptionId'] = $reinscriptionId;
                $childColumns = array_keys($childData);
                $childPlaceholders = array_map(static function ($column) {
                    return ':' . $column;
                }, $childColumns);

                $childSql = 'INSERT INTO `reinscription_children` (`' . implode('`, `', $childColumns) . '`) VALUES (' . implode(', ', $childPlaceholders) . ')';
                $childStmt = $db->prepare($childSql);
                $childStmt->execute($childData);
            }

            $db->commit();

            return self::findWithChildren($reinscriptionId);
        } catch (\Throwable $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }

            throw $e;
        }
    }

    /**
     * Met à jour le statut d'un dossier
     */
    public static function updateStatus($id, $status) {
        $db = self::connection();
        $stmt = $db->prepare('UPDATE `' . static::$table . '` SET `status` = :status WHERE `id` = :id');
        $stmt->execute([
            'status' => $status,
            'id' => (int) $id,
        ]);

        if ($stmt->rowCount() === 0) {
            $exists = self::findWithChildren($id);
            return $exists ? $exists : null;
        }

        return self::findWithChildren($id);
    }

    /**
     * Récupère la connexion PDO
     */
    private static function connection() {
        return \DatabaseConfig::getInstance()->getConnection();
    }

    /**
     * Hydrate plusieurs dossiers avec leurs enfants
     */
    private static function hydrateRowsWithChildren(array $rows) {
        if (empty($rows)) {
            return [];
        }

        $childrenMap = self::fetchChildrenMap(array_column($rows, 'id'));

        return array_map(function ($row) use ($childrenMap) {
            $row['children'] = $childrenMap[(int) $row['id']] ?? [];
            return $row;
        }, $rows);
    }

    /**
     * Récupère les enfants groupés par dossier
     */
    private static function fetchChildrenMap(array $reinscriptionIds) {
        $db = self::connection();
        $reinscriptionIds = array_values(array_filter(array_map('intval', $reinscriptionIds), static function ($value) {
            return $value > 0;
        }));

        if (empty($reinscriptionIds)) {
            return [];
        }

        $placeholders = implode(', ', array_fill(0, count($reinscriptionIds), '?'));
        $sql = 'SELECT * FROM `reinscription_children` WHERE `reinscriptionId` IN (' . $placeholders . ') ORDER BY `sortOrder` ASC, `id` ASC';
        $stmt = $db->prepare($sql);
        $stmt->execute($reinscriptionIds);

        $childrenMap = [];
        while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            $childrenMap[(int) $row['reinscriptionId']][] = $row;
        }

        return $childrenMap;
    }
}