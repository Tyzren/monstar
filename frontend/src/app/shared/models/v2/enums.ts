import { z } from 'zod';

export const gradesEnum = z.enum(['HD', 'D', 'C', 'P', 'N']);

export const semestersEnum = z.enum([
  'First semester',
  'Second semester',
  'Summer semester A',
  'Summer semester B',
  'Research quarter 1',
  'Research quarter 2',
  'Research quarter 3',
  'Research quarter 4',
  'Winter semester',
  'Full year',
  'First semester (Northern)',
  'Trimester 2',
  'Second semester to First semester',
  'Term 1',
  'Term 2',
  'Term 3',
  'Trimester 3',
  'Teaching period 3',
  'Teaching period 4',
  'Teaching period 5',
]);

export const campusesEnum = z.enum([
  'Clayton',
  'Caulfield',
  'Malaysia',
  'Overseas',
  'Peninsula',
  'City (Melbourne)',
  'Alfred Hospital',
  'Monash Online',
  'Monash Medical Centre',
  'Monash Law Chambers',
  'Notting Hill',
  'Parkville',
  'Hudson Institute of Medical Research',
  'Gippsland',
  'Indonesia',
  'Box Hill',
  'Warragul',
  'Prato',
  'Suzhou (SEU)',
  'Southbank',
  'Moe',
]);

export const facultiesEnum = z.enum([
  'Art, Design and Architecture',
  'Arts',
  'Business and Economics',
  'Education',
  'Engineering',
  'Information Technology',
  'Law',
  'Medicine, Nursing and Health Sciences',
  'Pharmacy and Pharmaceutical Sciences',
  'Science',
]);
