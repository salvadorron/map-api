CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY,
    name CHARACTER VARYING(255) NOT NULL,
    icon CHARACTER VARYING(255),
    color CHARACTER VARYING(50),
    parent_id UUID,
    element_type CHARACTER VARYING(50),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.filled_forms (
    id UUID PRIMARY KEY,
    form_version_id UUID NOT NULL,
    shape_id UUID NOT NULL,
    records JSONB NOT NULL,
    title CHARACTER VARYING(255) NOT NULL,
    user_id UUID,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.forms (
    id UUID PRIMARY KEY,
    title CHARACTER VARYING(255) NOT NULL,
    tag CHARACTER VARYING(100),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.form_versions (
    id UUID PRIMARY KEY,
    form_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    inputs JSONB[] NOT NULL,
    title CHARACTER VARYING(255) NOT NULL,
    tag CHARACTER VARYING(100),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(form_id, version_number)
);

CREATE TABLE IF NOT EXISTS public.municipalities (
    id UUID PRIMARY KEY,
    name CHARACTER VARYING(255) NOT NULL,
    short_name TEXT,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.parrishes (
    id UUID PRIMARY KEY,
    name CHARACTER VARYING(255) NOT NULL,
    code CHARACTER VARYING(255) NOT NULL,
    municipality_id UUID NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE TYPE public.status AS ENUM ('PENDING', 'APPROVED', 'CANCELLED');

CREATE TABLE IF NOT EXISTS public.shapes (
    id UUID PRIMARY KEY,
    properties JSONB,
    geom GEOMETRY NOT NULL,
    institution_id UUID,
    status status NOT NULL DEFAULT 'PENDING',
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
);


CREATE TABLE IF NOT EXISTS public.shapes_categories (
    shape_id UUID NOT NULL,
    category_id UUID NOT NULL,
    PRIMARY KEY (shape_id, category_id)
);

CREATE TYPE public.user_role AS ENUM ('SUPER_ADMIN', 'ADMIN_USER', 'OPERATOR_USER');

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    fullname CHARACTER VARYING(255) NOT NULL,
    email CHARACTER VARYING(255) NOT NULL UNIQUE,
    username CHARACTER VARYING(255) NOT NULL UNIQUE,
    password CHARACTER VARYING(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'OPERATOR_USER',
    institution_id UUID,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code CHARACTER VARYING(255) NOT NULL UNIQUE,
    name CHARACTER VARYING(255) NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.institution_category_assignment (
    institution_id UUID NOT NULL,
    category_id UUID NOT NULL,
    PRIMARY KEY (institution_id, category_id)
);

CREATE TABLE IF NOT EXISTS public.form_category_assignment (
    form_id UUID NOT NULL,
    category_id UUID NOT NULL,
    PRIMARY KEY (form_id, category_id)
);

CREATE TABLE IF NOT EXISTS public.logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action CHARACTER VARYING(100) NOT NULL,
    resource_type CHARACTER VARYING(100) NOT NULL,
    resource_id UUID,
    user_id UUID,
    details JSONB,
    ip_address CHARACTER VARYING(45),
    user_agent TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
);

-- Foreign Keys
ALTER TABLE ONLY public.categories ADD CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.form_versions ADD CONSTRAINT fk_form_version_form_id FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.filled_forms ADD CONSTRAINT fk_filled_form_version_id FOREIGN KEY (form_version_id) REFERENCES public.form_versions(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.filled_forms ADD CONSTRAINT fk_shape_id FOREIGN KEY (shape_id) REFERENCES public.shapes(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.parrishes ADD CONSTRAINT fk_municipality_id FOREIGN KEY (municipality_id) REFERENCES public.municipalities(id);
ALTER TABLE ONLY public.shapes_categories ADD CONSTRAINT fk_sc_shape_id FOREIGN KEY (shape_id) REFERENCES public.shapes(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.shapes_categories ADD CONSTRAINT fk_sc_category_id FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.users ADD CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.users ADD CONSTRAINT fk_user_institution FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.form_category_assignment ADD CONSTRAINT fk_fca_form_id FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.form_category_assignment ADD CONSTRAINT fk_fca_category_id FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.shapes ADD CONSTRAINT fk_shape_institution FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.filled_forms ADD CONSTRAINT fk_filled_form_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.institution_category_assignment ADD CONSTRAINT fk_ica_institution_id FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.institution_category_assignment ADD CONSTRAINT fk_ica_category_id FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.logs ADD CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Índices
CREATE INDEX IF NOT EXISTS idx_shapes_geom ON public.shapes USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_institution_id ON public.users(institution_id);
CREATE INDEX IF NOT EXISTS idx_shapes_institution_id ON public.shapes(institution_id);
CREATE INDEX IF NOT EXISTS idx_shapes_is_public ON public.shapes(is_public);
CREATE INDEX IF NOT EXISTS idx_shapes_institution_public ON public.shapes(institution_id, is_public);
CREATE INDEX IF NOT EXISTS idx_shapes_categories_shape_id ON public.shapes_categories(shape_id);
CREATE INDEX IF NOT EXISTS idx_shapes_categories_category_id ON public.shapes_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_form_category_assignment_form_id ON public.form_category_assignment(form_id);
CREATE INDEX IF NOT EXISTS idx_form_category_assignment_category_id ON public.form_category_assignment(category_id);
CREATE INDEX IF NOT EXISTS idx_institution_category_assignment_institution_id ON public.institution_category_assignment(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_category_assignment_category_id ON public.institution_category_assignment(category_id);
CREATE INDEX IF NOT EXISTS idx_filled_forms_shape_id ON public.filled_forms(shape_id);
CREATE INDEX IF NOT EXISTS idx_filled_forms_form_version_id ON public.filled_forms(form_version_id);
CREATE INDEX IF NOT EXISTS idx_filled_forms_user_id ON public.filled_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_form_versions_form_id ON public.form_versions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_versions_is_active ON public.form_versions(form_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_parrishes_municipality_id ON public.parrishes(municipality_id);
CREATE INDEX IF NOT EXISTS idx_institutions_code ON public.institutions(code);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON public.logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_resource_type ON public.logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_logs_resource_id ON public.logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_logs_action ON public.logs(action);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON public.logs(created_at);
