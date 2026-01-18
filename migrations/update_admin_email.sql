-- Update the admin email to the correct one
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'maicontsuda@gmail.com.br';

-- Verify the update
SELECT email, role, full_name FROM profiles WHERE email = 'maicontsuda@gmail.com.br';
