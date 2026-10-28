-- USERS
CREATE TABLE IF NOT EXISTS users_app (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamp DEFAULT now()
);

-- CLIENTES
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  created_at timestamp DEFAULT now()
);

-- TIPOS DE CÓDIGO DE BARRAS
CREATE TABLE IF NOT EXISTS barcode_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  zpl_command text NOT NULL
);

-- MODELOS DE ETIQUETAS
CREATE TABLE IF NOT EXISTS label_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id),
  name text NOT NULL,
  tag text UNIQUE NOT NULL,
  width_mm integer,
  height_mm integer,
  dpi integer,
  orientation char(1),
  zpl_template text NOT NULL,
  created_at timestamp DEFAULT now()
);

-- CAMPOS DO TEMPLATE
CREATE TABLE IF NOT EXISTS template_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES label_templates(id),
  name text NOT NULL,
  label text NOT NULL,
  field_type text NOT NULL,
  is_fixed boolean DEFAULT false,
  x_mm numeric,
  y_mm numeric,
  barcode_type text,
  required boolean DEFAULT false
);

-- MAPEAMENTOS XML → CAMPOS
CREATE TABLE IF NOT EXISTS mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_field_id uuid NOT NULL REFERENCES template_fields(id),
  xml_path text NOT NULL,
  transformation text
);

-- DOCUMENTOS RECEBIDOS (XML / PDF)
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id),
  filename text,
  file_type text,
  uploaded_at timestamp DEFAULT now()
);

-- ETIQUETAS GERADAS
CREATE TABLE IF NOT EXISTS generated_labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES label_templates(id),
  payload jsonb NOT NULL,
  zpl text NOT NULL,
  created_at timestamp DEFAULT now()
);
