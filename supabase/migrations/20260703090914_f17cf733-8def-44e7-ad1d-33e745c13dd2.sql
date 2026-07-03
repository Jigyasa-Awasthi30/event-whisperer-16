
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'organizer', 'customer');
CREATE TYPE public.event_type AS ENUM ('movie', 'concert');
CREATE TYPE public.event_status AS ENUM ('draft', 'pending', 'published', 'cancelled', 'completed');
CREATE TYPE public.seat_status AS ENUM ('available', 'held', 'booked', 'disabled');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'refunded');
CREATE TYPE public.payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TYPE public.organizer_status AS ENUM ('pending', 'approved', 'rejected');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  city TEXT,
  organizer_status public.organizer_status,
  organizer_company TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "profiles readable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "admins manage profiles" ON public.profiles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- ============ VENUES ============
CREATE TABLE public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  capacity INT NOT NULL DEFAULT 100,
  image_url TEXT,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.venues TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.venues TO authenticated;
GRANT ALL ON public.venues TO service_role;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "venues public read" ON public.venues FOR SELECT USING (true);
CREATE POLICY "organizers/admin manage venues" ON public.venues FOR ALL USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'organizer'));

-- ============ SEAT CATEGORIES ============
CREATE TABLE public.seat_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  sort_order INT NOT NULL DEFAULT 0
);
GRANT SELECT ON public.seat_categories TO anon, authenticated;
GRANT ALL ON public.seat_categories TO service_role;
ALTER TABLE public.seat_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seat cats public read" ON public.seat_categories FOR SELECT USING (true);
CREATE POLICY "admins manage seat cats" ON public.seat_categories FOR ALL USING (public.has_role(auth.uid(),'admin'));

INSERT INTO public.seat_categories (name, color, sort_order) VALUES
  ('Premium', '#a855f7', 1),
  ('Gold', '#eab308', 2),
  ('Silver', '#94a3b8', 3),
  ('Standard', '#3b82f6', 4),
  ('Economy', '#22c55e', 5);

-- ============ EVENTS ============
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type public.event_type NOT NULL,
  banner_url TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  starts_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 120,
  language TEXT,
  genre TEXT,
  age_rating TEXT,
  city TEXT,
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  status public.event_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX events_status_idx ON public.events(status);
CREATE INDEX events_type_idx ON public.events(event_type);
CREATE INDEX events_starts_idx ON public.events(starts_at);
GRANT SELECT ON public.events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events public read published" ON public.events FOR SELECT USING (status = 'published' OR organizer_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "organizers insert own events" ON public.events FOR INSERT WITH CHECK (auth.uid() = organizer_id AND (public.has_role(auth.uid(),'organizer') OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "organizers update own events" ON public.events FOR UPDATE USING (auth.uid() = organizer_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "organizers delete own events" ON public.events FOR DELETE USING (auth.uid() = organizer_id OR public.has_role(auth.uid(),'admin'));

-- ============ SEATS ============
CREATE TABLE public.seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.seat_categories(id) ON DELETE SET NULL,
  row_label TEXT NOT NULL,
  seat_number INT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  status public.seat_status NOT NULL DEFAULT 'available',
  held_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  held_until TIMESTAMPTZ,
  UNIQUE (event_id, row_label, seat_number)
);
CREATE INDEX seats_event_idx ON public.seats(event_id);
CREATE INDEX seats_status_idx ON public.seats(status);
GRANT SELECT, UPDATE ON public.seats TO authenticated;
GRANT SELECT ON public.seats TO anon;
GRANT ALL ON public.seats TO service_role;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seats public read" ON public.seats FOR SELECT USING (true);
CREATE POLICY "seats hold by authenticated" ON public.seats FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "seats insert organizer" ON public.seats FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
);
CREATE POLICY "seats delete organizer" ON public.seats FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
);

-- ============ BOOKINGS ============
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code TEXT NOT NULL UNIQUE DEFAULT ('BK' || upper(substring(md5(random()::text) from 1 for 8))),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status public.booking_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX bookings_user_idx ON public.bookings(user_id);
CREATE INDEX bookings_event_idx ON public.bookings(event_id);
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings user read" ON public.bookings FOR SELECT USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid())
);
CREATE POLICY "bookings user insert" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookings user update" ON public.bookings FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- ============ BOOKING SEATS ============
CREATE TABLE public.booking_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  seat_id UUID NOT NULL REFERENCES public.seats(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  UNIQUE (seat_id)
);
GRANT SELECT, INSERT, DELETE ON public.booking_seats TO authenticated;
GRANT ALL ON public.booking_seats TO service_role;
ALTER TABLE public.booking_seats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "booking_seats read" ON public.booking_seats FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.user_id = auth.uid() OR public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = b.event_id AND e.organizer_id = auth.uid())))
);
CREATE POLICY "booking_seats insert" ON public.booking_seats FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.user_id = auth.uid())
);

-- ============ PAYMENTS ============
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'pending',
  method TEXT DEFAULT 'mock',
  transaction_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments read own" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.user_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
);
CREATE POLICY "payments insert own" ON public.payments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.user_id = auth.uid())
);

-- ============ WAITLIST ============
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  seats_wanted INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'waiting',
  offered_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.waitlist TO authenticated;
GRANT ALL ON public.waitlist TO service_role;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "waitlist own" ON public.waitlist FOR ALL USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications own" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- ============ TRIGGERS ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER events_updated BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
