CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY,
    name CHARACTER VARYING(255),
    icon CHARACTER VARYING(255),
    color CHARACTER VARYING,
    parent_id UUID,
    element_type CHARACTER VARYING,

    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.filled_forms (
    id UUID PRIMARY KEY,
    form_id UUID NOT NULL,
    shape_id UUID NOT NULL,
    records JSON NOT NULL,
    title CHARACTER VARYING(255) NOT NULL,
    
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.forms (
    id UUID PRIMARY KEY,
    inputs JSON[],
    title CHARACTER VARYING(255),
    category_id UUID NOT NULL,
    tag CHARACTER VARYING,

    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
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

CREATE TABLE IF NOT EXISTS public.shapes (
    id UUID PRIMARY KEY,
    properties JSON,
    geom GEOMETRY NOT NULL,
    
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.shapes_categories (
    shape_id UUID NOT NULL,
    category_id UUID NOT NULL,
    PRIMARY KEY (shape_id, category_id)
);

ALTER TABLE ONLY public.filled_forms ADD CONSTRAINT fk_form_id FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.filled_forms ADD CONSTRAINT fk_shape_id FOREIGN KEY (shape_id) REFERENCES public.shapes(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.forms ADD CONSTRAINT fk_category_id FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.parrishes ADD CONSTRAINT fk_municipality_id FOREIGN KEY (municipality_id) REFERENCES public.municipalities(id);

ALTER TABLE ONLY public.shapes_categories ADD CONSTRAINT fk_sc_shape_id FOREIGN KEY (shape_id) REFERENCES public.shapes(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.shapes_categories ADD CONSTRAINT fk_sc_category_id FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;