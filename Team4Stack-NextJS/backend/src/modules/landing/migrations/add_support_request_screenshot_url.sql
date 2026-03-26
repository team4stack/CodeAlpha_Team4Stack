-- Adds optional Cloudinary screenshot URL support for contact/support requests.
ALTER TABLE support_requests
ADD COLUMN IF NOT EXISTS screenshot_url TEXT;
