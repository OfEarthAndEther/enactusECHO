-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('normal', 'admin', 'superadmin');

-- Create enum for e-waste types
CREATE TYPE public.waste_type AS ENUM (
  'battery',
  'charger',
  'cable_wire',
  'mouse_keyboard',
  'monitor',
  'cpu',
  'mobile',
  'accessories',
  'other'
);

-- Create enum for verification status
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  college_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  department TEXT,
  roll_no TEXT,
  points_total INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT valid_college_id CHECK (college_id ~ '^[A-Za-z0-9]+$')
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create bins table
CREATE TABLE public.bins (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location_description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  last_emptied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  waste_type waste_type NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('kg', 'units')),
  bin_id INTEGER REFERENCES public.bins(id),
  bag_number TEXT,
  photo_url TEXT,
  notes TEXT,
  points_earned INTEGER DEFAULT 0,
  verification_status verification_status DEFAULT 'pending',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  verification_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT positive_quantity CHECK (quantity > 0)
);

-- Create partners table
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  coupon_details TEXT,
  logo_url TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Only superadmins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'superadmin'));

-- RLS Policies for bins (public read)
CREATE POLICY "Anyone can view bins"
  ON public.bins FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage bins"
  ON public.bins FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- RLS Policies for submissions
CREATE POLICY "Users can view own submissions"
  ON public.submissions FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Users can create own submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending submissions"
  ON public.submissions FOR UPDATE
  USING (auth.uid() = user_id AND verification_status = 'pending');

CREATE POLICY "Admins can verify submissions"
  ON public.submissions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- RLS Policies for partners (public read)
CREATE POLICY "Anyone can view partners"
  ON public.partners FOR SELECT
  USING (true);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, college_id, email, department, roll_no)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'college_id', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'roll_no'
  );
  
  -- Assign default 'normal' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'normal');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update points_total when submission is verified
CREATE OR REPLACE FUNCTION public.update_user_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.verification_status = 'verified' AND OLD.verification_status = 'pending' THEN
    UPDATE public.profiles
    SET points_total = points_total + NEW.points_earned
    WHERE id = NEW.user_id;
  ELSIF NEW.verification_status = 'rejected' AND OLD.verification_status = 'verified' THEN
    -- Deduct points if previously verified submission is rejected
    UPDATE public.profiles
    SET points_total = GREATEST(0, points_total - OLD.points_earned)
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_submission_verified
  AFTER UPDATE ON public.submissions
  FOR EACH ROW
  WHEN (OLD.verification_status IS DISTINCT FROM NEW.verification_status)
  EXECUTE FUNCTION public.update_user_points();

-- Insert default bins
INSERT INTO public.bins (name, location_description, latitude, longitude) VALUES
  ('North Gate', 'Near the main North entrance of campus', 28.6139, 77.0428),
  ('Student Centre', 'Outside the Student Activity Centre', 28.6142, 77.0435),
  ('Near Fountain', 'Central campus fountain area', 28.6145, 77.0432),
  ('Faculty Quarters', 'Near faculty residential area', 28.6148, 77.0438),
  ('Library Block', 'Behind the main library building', 28.6141, 77.0440),
  ('Academic Block A', 'Ground floor, Academic Block A', 28.6144, 77.0430);