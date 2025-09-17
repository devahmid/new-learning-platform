<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class StudentProgressAnalytics
{
    private $db;
    private $table = 'student_progress_analytics';

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Créer ou mettre à jour les analytics de progression d'un étudiant
     */
    public function createOrUpdate($data)
    {
        $sql = "INSERT INTO {$this->table} 
                (userId, courseId, subject, totalStudyTime, averageSessionDuration, studyStreak, 
                 lastStudyDate, lessonsCompleted, totalLessons, averageScore, bestScore, worstScore,
                 preferredStudyTime, preferredStudyDay, averageAttemptsPerLesson, difficultyAreas, 
                 strongAreas, needsReview, needsPractice, readyForNextLevel)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                totalStudyTime = VALUES(totalStudyTime),
                averageSessionDuration = VALUES(averageSessionDuration),
                studyStreak = VALUES(studyStreak),
                lastStudyDate = VALUES(lastStudyDate),
                lessonsCompleted = VALUES(lessonsCompleted),
                totalLessons = VALUES(totalLessons),
                averageScore = VALUES(averageScore),
                bestScore = VALUES(bestScore),
                worstScore = VALUES(worstScore),
                preferredStudyTime = VALUES(preferredStudyTime),
                preferredStudyDay = VALUES(preferredStudyDay),
                averageAttemptsPerLesson = VALUES(averageAttemptsPerLesson),
                difficultyAreas = VALUES(difficultyAreas),
                strongAreas = VALUES(strongAreas),
                needsReview = VALUES(needsReview),
                needsPractice = VALUES(needsPractice),
                readyForNextLevel = VALUES(readyForNextLevel),
                updatedAt = CURRENT_TIMESTAMP";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['userId'],
            $data['courseId'] ?? null,
            $data['subject'] ?? null,
            $data['totalStudyTime'] ?? 0,
            $data['averageSessionDuration'] ?? 0.00,
            $data['studyStreak'] ?? 0,
            $data['lastStudyDate'] ?? null,
            $data['lessonsCompleted'] ?? 0,
            $data['totalLessons'] ?? 0,
            $data['averageScore'] ?? 0.00,
            $data['bestScore'] ?? 0.00,
            $data['worstScore'] ?? 0.00,
            $data['preferredStudyTime'] ?? null,
            $data['preferredStudyDay'] ?? null,
            $data['averageAttemptsPerLesson'] ?? 0.0,
            json_encode($data['difficultyAreas'] ?? []),
            json_encode($data['strongAreas'] ?? []),
            $data['needsReview'] ?? false,
            $data['needsPractice'] ?? false,
            $data['readyForNextLevel'] ?? false
        ]);
    }

    /**
     * Récupérer les analytics d'un étudiant
     */
    public function getByUserId($userId, $courseId = null, $subject = null)
    {
        $sql = "SELECT * FROM {$this->table} WHERE userId = ?";
        $params = [$userId];

        if ($courseId !== null) {
            $sql .= " AND courseId = ?";
            $params[] = $courseId;
        }

        if ($subject !== null) {
            $sql .= " AND subject = ?";
            $params[] = $subject;
        }

        $sql .= " ORDER BY updatedAt DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer les analytics détaillées pour le dashboard parent
     */
    public function getDetailedAnalytics($userId)
    {
        $sql = "SELECT 
                    spa.*,
                    c.title as courseTitle,
                    c.description as courseDescription
                FROM {$this->table} spa
                LEFT JOIN courses c ON spa.courseId = c.id
                WHERE spa.userId = ?
                ORDER BY spa.updatedAt DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Calculer les statistiques globales d'un étudiant
     */
    public function getGlobalStats($userId)
    {
        $sql = "SELECT 
                    COUNT(DISTINCT courseId) as totalCourses,
                    SUM(lessonsCompleted) as totalLessonsCompleted,
                    SUM(totalLessons) as totalLessons,
                    AVG(averageScore) as globalAverageScore,
                    SUM(totalStudyTime) as totalStudyTime,
                    MAX(studyStreak) as bestStreak,
                    MAX(lastStudyDate) as lastActivity
                FROM {$this->table} 
                WHERE userId = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Identifier les zones de difficulté
     */
    public function getDifficultyAnalysis($userId)
    {
        $sql = "SELECT 
                    subject,
                    AVG(averageScore) as avgScore,
                    COUNT(*) as lessonCount,
                    SUM(CASE WHEN needsReview = 1 THEN 1 ELSE 0 END) as reviewCount
                FROM {$this->table} 
                WHERE userId = ? 
                GROUP BY subject
                HAVING avgScore < 70 OR reviewCount > 0
                ORDER BY avgScore ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Mettre à jour le streak d'étude
     */
    public function updateStudyStreak($userId)
    {
        $sql = "UPDATE {$this->table} 
                SET studyStreak = studyStreak + 1,
                    lastStudyDate = NOW(),
                    updatedAt = CURRENT_TIMESTAMP
                WHERE userId = ? AND DATE(lastStudyDate) = DATE(NOW() - INTERVAL 1 DAY)";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$userId]);
    }

    /**
     * Réinitialiser le streak si pas d'activité
     */
    public function resetStudyStreak($userId)
    {
        $sql = "UPDATE {$this->table} 
                SET studyStreak = 0,
                    updatedAt = CURRENT_TIMESTAMP
                WHERE userId = ? AND DATE(lastStudyDate) < DATE(NOW() - INTERVAL 1 DAY)";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$userId]);
    }
}
