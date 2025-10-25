// Modelo base del usuario que viene de Keycloak
export interface UsuarioDTO {
    id: number;
    description: string;
    phone: string;
    email: string;
    location: string;
    name: string;
    surname: string;
    imageUrl: string;
    linkedinUrl: string;
    role: string;
}

// DTOs de idiomas actualizados según backend
export interface IdiomaDTO {
    id: number;
    name: string;
    level: number;
}

// Enumeración para el tamaño de empresa
export enum CompanySize {
    FROM_1_TO_10 = 'FROM_1_TO_10',
    FROM_11_TO_50 = 'FROM_11_TO_50',
    FROM_51_TO_200 = 'FROM_51_TO_200',
    FROM_201_TO_500 = 'FROM_201_TO_500',
    MORE_THAN_500 = 'MORE_THAN_500'
}