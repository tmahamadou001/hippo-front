// ============================================================================
// SEAT TYPES (Frontend)
// ============================================================================

export type SeatPosition = 'window' | 'aisle' | 'middle'

export type SeatType = 'standard' | 'premium' | 'comfort' | 'vip'

export type SeatFeature = 
  | 'extra-legroom'
  | 'panorama'
  | 'table'
  | 'power-outlet'
  | 'usb-port'
  | 'wifi'
  | 'reclining'
  | 'near-toilet'
  | 'near-exit'

export interface Seat {
  id: string
  row: number
  column: string
  position: SeatPosition
  type?: SeatType
  features?: SeatFeature[]
  price_modifier?: number
  available: boolean
}

export interface SeatLayout {
  rows: number
  columns: number
  aisleAfter?: number[]
}

export interface SeatMapMetadata {
  hasToilet?: boolean
  toiletPosition?: 'front' | 'back'
  hasTable?: boolean
  tableRows?: number[]
  driverSide?: 'left' | 'right'
}

export interface SeatMap {
  layout: SeatLayout
  seats: Seat[]
  metadata?: SeatMapMetadata
}

export interface SeatStatus {
  id: string
  status: 'available' | 'occupied' | 'locked' | 'disabled'
  reservationId?: string
  lockId?: string
  passengerName?: string
}

export interface DepartureSeatAvailability {
  departureId: string
  seatMap: SeatMap
  occupiedSeats: string[]
  lockedSeats: string[]
  unavailableSeats: string[]
  seatStatuses: SeatStatus[]
}

export interface SeatMapTemplate {
  id: string
  name: string
  description: string
  totalSeats: number
  icon?: string
}

export const SEAT_MAP_TEMPLATES: SeatMapTemplate[] = [
  {
    id: 'bus-30-2x2',
    name: 'Bus 30 places (2-2)',
    description: 'Disposition standard avec 2 sièges de chaque côté',
    totalSeats: 30,
    icon: '🚌'
  },
  {
    id: 'bus-40-2x2',
    name: 'Bus 40 places (2-2)',
    description: 'Disposition standard avec 2 sièges de chaque côté',
    totalSeats: 40,
    icon: '🚌'
  },
  {
    id: 'bus-50-2x2',
    name: 'Bus 50 places (2-2)',
    description: 'Disposition standard avec 2 sièges de chaque côté',
    totalSeats: 50,
    icon: '🚌'
  },
  {
    id: 'bus-60-2x3',
    name: 'Bus 60 places (2-3)',
    description: 'Disposition haute capacité avec 2 sièges à gauche et 3 à droite',
    totalSeats: 60,
    icon: '🚍'
  }
]

// Utilitaires
export class SeatMapUtils {
  static columnNumberToLetter(col: number): string {
    return String.fromCharCode(64 + col)
  }

  static columnLetterToNumber(letter: string): number {
    return letter.charCodeAt(0) - 64
  }

  static generateSeatId(row: number, column: string): string {
    return `${row}${column}`
  }

  static determineSeatPosition(
    col: number,
    totalCols: number,
    aisleAfter?: number[]
  ): SeatPosition {
    if (col === 1 || col === totalCols) {
      return 'window'
    }

    if (aisleAfter) {
      for (const aisleCol of aisleAfter) {
        if (col === aisleCol || col === aisleCol + 1) {
          return 'aisle'
        }
      }
    }

    return 'middle'
  }

  static generateDefaultSeats(
    rows: number,
    columns: number,
    aisleAfter?: number[]
  ): Seat[] {
    const seats: Seat[] = []

    for (let row = 1; row <= rows; row++) {
      for (let col = 1; col <= columns; col++) {
        const column = this.columnNumberToLetter(col)
        const id = this.generateSeatId(row, column)
        const position = this.determineSeatPosition(col, columns, aisleAfter)

        const type: SeatType = row === 1 ? 'premium' : 'standard'
        const features: SeatFeature[] = row === 1 ? ['extra-legroom', 'panorama'] : []
        const price_modifier = row === 1 ? 1000 : 0

        seats.push({
          id,
          row,
          column,
          position,
          type,
          features,
          price_modifier,
          available: true
        })
      }
    }

    return seats
  }

  static getSeatTypeColor(type?: SeatType): string {
    switch (type) {
      case 'premium':
        return 'bg-yellow-100 border-yellow-400 text-yellow-800'
      case 'comfort':
        return 'bg-blue-100 border-blue-400 text-blue-800'
      case 'vip':
        return 'bg-purple-100 border-purple-400 text-purple-800'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700'
    }
  }

  static getSeatStatusColor(status: string): string {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-400 text-green-800 hover:bg-green-200'
      case 'occupied':
        return 'bg-red-100 border-red-400 text-red-800 cursor-not-allowed'
      case 'locked':
        return 'bg-orange-100 border-orange-400 text-orange-800 cursor-not-allowed'
      case 'disabled':
        return 'bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed opacity-50'
      case 'selected':
        return 'bg-blue-500 border-blue-600 text-white'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700'
    }
  }
}
