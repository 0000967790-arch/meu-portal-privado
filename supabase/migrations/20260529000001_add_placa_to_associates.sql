-- Adiciona campo placa à tabela associates
-- A placa serve como senha do associado no sistema de login
ALTER TABLE public.associates
  ADD COLUMN IF NOT EXISTS placa TEXT;
