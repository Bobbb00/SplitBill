ALTER TABLE expenses
ADD COLUMN category_id INT DEFAULT 7 AFTER group_id;

ALTER TABLE expenses
ADD CONSTRAINT fk_expense_category FOREIGN KEY (category_id) REFERENCES
categories(id) ON DELETE SET NULL;