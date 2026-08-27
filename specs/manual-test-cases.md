# Manual Test Cases

Target: <https://www.saucedemo.com/>  
Default data: `standard_user` / `secret_sauce` unless a case says otherwise.  
Common precondition: start in a fresh browser session on the login page.

## Authentication and session

### TC-01 — Successful standard-user login

- Priority: P0 | Type: Smoke, functional
- Steps: Enter the default username and password; select **Login**.
- Expected: `/inventory.html` opens, **Products** is visible, and no error banner appears.

### TC-02 — Locked user is denied access

- Priority: P1 | Type: Negative
- Steps: Sign in as `locked_out_user` with `secret_sauce`.
- Expected: Login remains blocked and the message states that the user is locked out.

### TC-03 — Username is required

- Priority: P1 | Type: Validation
- Steps: Leave username empty, enter `secret_sauce`, and select **Login**.
- Expected: The user stays on the login page and sees `Username is required`.

### TC-04 — Password is required

- Priority: P1 | Type: Validation
- Steps: Enter `standard_user`, leave password empty, and select **Login**.
- Expected: The user stays on the login page and sees `Password is required`.

### TC-05 — Invalid credentials are rejected

- Priority: P1 | Type: Negative
- Steps: Enter an unknown username and password; select **Login**.
- Expected: Authentication fails with a non-revealing username/password mismatch message.

### TC-06 — Authenticated user can log out

- Priority: P1 | Type: Functional
- Steps: Sign in; open the menu; select **Logout**; use browser Back.
- Expected: The login page opens and the protected inventory does not become usable through Back.

## Catalogue and cart

### TC-07 — Catalogue shows complete product data

- Priority: P0 | Type: Smoke, content
- Steps: Sign in; inspect all catalogue cards.
- Expected: Exactly six products appear; every card has a distinct name, image, description, price, and add button.

### TC-08 — Sort products by price low to high

- Priority: P1 | Type: Functional
- Steps: Sign in; choose **Price (low to high)**.
- Expected: Prices appear as `$7.99, $9.99, $15.99, $15.99, $29.99, $49.99`.

### TC-09 — Sort products by name Z to A

- Priority: P2 | Type: Functional
- Steps: Sign in; choose **Name (Z to A)**.
- Expected: Product names are in descending alphabetical order and no product disappears.

### TC-10 — Add one product to the cart

- Priority: P0 | Type: Smoke, functional
- Steps: Add **Sauce Labs Backpack**; open the cart.
- Expected: Badge count is `1`; the cart contains the backpack with the same name, price, and quantity `1`.

### TC-11 — Add multiple products

- Priority: P1 | Type: Functional
- Steps: Add the backpack and bike light; open the cart.
- Expected: Badge count is `2`; both products appear once and the other products do not appear.

### TC-12 — Remove a product from the cart

- Priority: P1 | Type: Functional
- Steps: Add the backpack; open the cart; remove it.
- Expected: The item disappears and the empty-cart badge is not shown.

### TC-13 — Cart survives catalogue navigation

- Priority: P1 | Type: State management
- Steps: Add a product; open the cart; continue shopping; return to the cart.
- Expected: The selected product and badge count remain unchanged.

## Checkout

### TC-14 — Complete a purchase

- Priority: P0 | Type: Smoke, end to end
- Steps: Add the backpack; check out; enter valid first name, last name, and postal code; continue; finish.
- Expected: Overview shows the correct item and totals; completion shows `Thank you for your order!`.

### TC-15 — First name is required at checkout

- Priority: P1 | Type: Validation
- Steps: Reach checkout information; leave all fields empty; select **Continue**.
- Expected: Checkout is blocked with `First Name is required`.

### TC-16 — Last name is required at checkout

- Priority: P1 | Type: Validation
- Steps: Enter only a first name; select **Continue**.
- Expected: Checkout is blocked with `Last Name is required` and the first name remains entered.

### TC-17 — Postal code is required at checkout

- Priority: P1 | Type: Validation
- Steps: Enter first and last name, leave postal code empty, and continue.
- Expected: Checkout is blocked with `Postal Code is required`; entered names remain intact.

## Accessibility and responsive behavior

### TC-18 — Core journey works without a mouse

- Priority: P1 | Type: Accessibility
- Steps: Use Tab/Shift+Tab and Enter to sign in, add the backpack, open the cart, and start checkout.
- Expected: Focus is always visible, order is logical, every control is operable, and no keyboard trap occurs.

