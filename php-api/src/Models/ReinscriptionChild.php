<?php

namespace App\Models;

/**
 * Modèle ReinscriptionChild - enfant rattaché à un dossier de réinscription
 */
class ReinscriptionChild extends BaseModel {
    protected static $table = 'reinscription_children';

    protected static $fillable = [
        'reinscriptionId',
        'sourceChildId',
        'schoolYear',
        'firstName',
        'lastName',
        'birthDate',
        'arabicLevel',
        'hasActivityOnWednesday',
        'hasActivityOnSaturday',
        'hasActivityOnSunday',
        'activityDetails',
        'status',
        'sortOrder'
    ];

    /**
     * Retourne le dossier parent
     */
    public function reinscription() {
        if ($this->reinscriptionId) {
            return Reinscription::find($this->reinscriptionId);
        }

        return null;
    }
}