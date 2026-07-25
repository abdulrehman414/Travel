import { buildPageMeta } from '@travel/types';
import type {
  CreateFlightInput,
  FlightDto,
  FlightQuery,
  Paginated,
  UpdateFlightInput,
} from '@travel/types';
import { flightRepository, type FlightRow } from './flight.repository';
import { NotFoundError } from '../../lib/api-error';

function toDto(row: FlightRow): FlightDto {
  return {
    id: row.id,
    airline: row.airline,
    airlineCode: row.airlineCode,
    flightNumber: row.flightNumber,
    origin: row.origin,
    destination: row.destination,
    departureTime: row.departureTime.toISOString(),
    arrivalTime: row.arrivalTime.toISOString(),
    cabinClass: row.cabinClass,
    basePrice: Number(row.basePrice),
    currency: row.currency,
    seatsAvailable: row.seatsAvailable,
    featured: row.featured,
    createdAt: row.createdAt.toISOString(),
  };
}

export const flightService = {
  async list(query: FlightQuery): Promise<Paginated<FlightDto>> {
    const { rows, total } = await flightRepository.list(query);
    return { items: rows.map(toDto), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async getById(id: string): Promise<FlightDto> {
    const row = await flightRepository.findById(id);
    if (!row) throw new NotFoundError('Flight not found');
    return toDto(row);
  },

  async create(input: CreateFlightInput): Promise<FlightDto> {
    return toDto(await flightRepository.create(input));
  },

  async update(id: string, input: UpdateFlightInput): Promise<FlightDto> {
    const existing = await flightRepository.findById(id);
    if (!existing) throw new NotFoundError('Flight not found');
    return toDto(await flightRepository.update(id, input));
  },

  async remove(id: string): Promise<void> {
    const existing = await flightRepository.findById(id);
    if (!existing) throw new NotFoundError('Flight not found');
    await flightRepository.delete(id);
  },
};
