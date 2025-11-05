import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Corresponsal = {
  id: string;
  user_id: string;
  nombre: string;
  contactoprincipal: string | null;
  emailcontacto: string | null;
  telefonocontacto: string | null;
  direccion: string | null;
  pais: string | null;
  observaciones: string | null;
  created_at: string;
};

export type Caso = {
  id: string;
  user_id: string;
  corresponsalid: string;
  nrocasoassistravel: string;
  nrocasocorresponsal: string | null;
  fechadeinicio: string | null;
  pais: string | null;
  informemedico: string | null;
  fee: number | null;
  costousd: number | null;
  costomonedalocal: number | null;
  simbolomoneda: string | null;
  montoagregado: number | null;
  total: number | null;
  tienefactura: boolean;
  nrofactura: string | null;
  fechaemisionfactura: string | null;
  fechavencimientofactura: string | null;
  fechapagofactura: string | null;
  estadointerno: string;
  estadodelcaso: string | null;
  observaciones: string | null;
  created_at: string;
};

export type CasoWithCorresponsal = Caso & {
  corresponsalnombre: string;
};