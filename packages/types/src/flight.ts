import { z } from 'zod';
import { booleanQueryParam, paginationQuerySchema } from './common';
import { currencySchema, type Currency } from './enums';

const iata = z.string().trim().length(3).toUpperCase();

export const createFlightSchema = z.object({
  airline: z.string().trim().min(1).max(120),
  airlineCode: z.string().trim().min(1).max(10),
  flightNumber: z.string().trim().min(1).max(20),
  origin: iata,
  destination: iata,
  departureTime: z.coerce.date(),
  arrivalTime: z.coerce.date(),
  cabinClass: z.string().trim().min(1).max(20),
  basePrice: z.number().nonnegative(),
  currency: currencySchema.default('SAR'),
  seatsAvailable: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
});
export type CreateFlightInput = z.infer<typeof createFlightSchema>;

export const updateFlightSchema = createFlightSchema.partial();
export type UpdateFlightInput = z.infer<typeof updateFlightSchema>;

export const flightQuerySchema = paginationQuerySchema.extend({
  origin: z.string().optional(),
  destination: z.string().optional(),
  cabinClass: z.string().optional(),
  featured: booleanQueryParam.optional(),
});
export type FlightQuery = z.infer<typeof flightQuerySchema>;

export interface FlightDto {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  cabinClass: string;
  basePrice: number;
  currency: Currency;
  seatsAvailable: number;
  featured: boolean;
  createdAt: string;
}
