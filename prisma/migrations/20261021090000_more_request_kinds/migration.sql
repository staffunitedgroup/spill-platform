-- Website enquiry forms (private events, franchise, investors, quick contact)
-- now land in Admin → Requests alongside livestream / podcast / Confessional.
ALTER TYPE "RequestKind" ADD VALUE IF NOT EXISTS 'PRIVATE_EVENT';
ALTER TYPE "RequestKind" ADD VALUE IF NOT EXISTS 'FRANCHISE';
ALTER TYPE "RequestKind" ADD VALUE IF NOT EXISTS 'INVESTOR';
ALTER TYPE "RequestKind" ADD VALUE IF NOT EXISTS 'CONTACT';
