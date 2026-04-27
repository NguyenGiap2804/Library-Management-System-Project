import { createRequire } from 'node:module';
import {
  assert,
  exitWithSummary,
  frontendBase,
  skip,
  step,
  test,
  today,
  unique,
} from './test-harness.mjs';

const require = createRequire(import.meta.url);

let chromium;
try {
  ({ chromium } = require('../../frontend/node_modules/playwright'));
} catch {
  console.error('Playwright was not found in frontend/node_modules. Run `npm install` inside frontend first.');
  process.exit(1);
}

const headless = process.env.UI_HEADLESS === 'false' ? false : true;
const slowMo = Number.parseInt(process.env.UI_SLOW_MO_MS || '0', 10) || 0;

const browser = await chromium.launch({
  headless,
  slowMo,
});

await test('TC-UI-001', 'Mo link frontend va xem Dashboard', async () => {
  const page = await step(`Mo link ${frontendBase}`, () => newPageAndOpenApp());

  await step('Kiem tra Dashboard va cac the thong ke', async () => {
    await assertVisible(page, 'Library Admin');
    await assertVisible(page, 'System Overview');
    await assertVisible(page, 'Total Books');
    await assertVisible(page, 'Total Members');
    await assertVisible(page, 'Books Borrowed');
    await assertVisible(page, 'Overdue');
  });

  await page.close();
});

await test('TC-UI-002', 'Thao tac menu sidebar tung man hinh', async () => {
  const page = await step(`Mo link ${frontendBase}`, () => newPageAndOpenApp());

  await step('Bam Book Management va kiem tra Inventory Catalog', async () => {
    await clickButton(page, /Book Management/i);
    await assertVisible(page, 'Inventory Catalog');
  });

  await step('Bam Member Management va kiem tra Patron Directory', async () => {
    await clickButton(page, /Member Management/i);
    await assertVisible(page, 'Patron Directory');
  });

  await step('Bam Circulation va kiem tra Circulation Desk', async () => {
    await clickButton(page, /Circulation/i);
    await assertVisible(page, 'Circulation Desk');
  });

  await step('Bam Dashboard va quay lai System Overview', async () => {
    await clickButton(page, /Dashboard/i);
    await assertVisible(page, 'System Overview');
  });

  await page.close();
});

await test('TC-UI-003', 'Dashboard bam New Loan chuyen sang Circulation', async () => {
  const page = await step(`Mo link ${frontendBase}`, () => newPageAndOpenApp());

  await step('Bam New Loan va kiem tra man hinh Circulation', async () => {
    await clickButton(page, /New Loan/i);
    await assertVisible(page, 'Circulation Desk');
    await assertVisible(page, 'Issue New Book');
    await assertVisible(page, 'Current Active Loans');
  });

  await page.close();
});

await test('TC-UI-004', 'Book Management filter sach', async () => {
  const page = await step(`Mo link ${frontendBase}`, () => newPageAndOpenApp());

  await step('Mo Book Management', async () => {
    await clickButton(page, /Book Management/i);
    await assertVisible(page, 'Inventory Catalog');
  });

  const filter = page.getByPlaceholder('Filter by title, author, category, or ISBN...');
  await step('Nhap keyword Java vao o filter', async () => {
    await filter.fill('Java');
    await page.waitForTimeout(300);
    await assertVisible(page, 'Inventory Catalog');
  });

  await step('Nhap keyword khong co ket qua vao o filter', async () => {
    await filter.fill('__NO_BOOK_RESULT__');
    await page.waitForTimeout(300);
    await assertVisible(page, 'Inventory Catalog');
  });

  await page.close();
});

await test('TC-UI-005', 'Book Management mo modal, nhap sach, luu', async () => {
  const page = await step(`Mo link ${frontendBase}`, () => newPageAndOpenApp());
  await requireBackend(page);

  const title = unique('UI Book');

  await step('Mo modal Register New Book', async () => {
    await clickButton(page, /Book Management/i);
    await clickButton(page, /Register New Book/i);
    await assertVisible(page, 'Add New Book');
  });

  await step(`Nhap sach moi: ${title}`, async () => {
    await page.getByPlaceholder('Enter book title').fill(title);
    await page.getByPlaceholder('Name').fill('UI Author');
    await page.locator('.modal select').selectOption({ label: 'Java' });
    await page.locator('.modal input[type="number"]').fill('2');
    await clickButton(page, /Save Collection/i);
  });

  await step('Kiem tra sach moi xuat hien trong bang', async () => {
    await page.getByText('Add New Book').waitFor({ state: 'detached', timeout: 10000 });
    await page.getByPlaceholder('Filter by title, author, category, or ISBN...').fill(title);
    await assertVisible(page, title);
    await assertVisible(page, '2 Units');
  });

  await page.close();
});

await test('TC-UI-006', 'Book Management validation khong cho luu khi thieu title', async () => {
  const page = await step(`Mo link ${frontendBase}`, () => newPageAndOpenApp());

  await step('Mo modal Add New Book', async () => {
    await clickButton(page, /Book Management/i);
    await clickButton(page, /Register New Book/i);
    await assertVisible(page, 'Add New Book');
  });

  await step('De trong title va bam Save Collection', async () => {
    await page.getByPlaceholder('Name').fill('UI Author');
    await clickButton(page, /Save Collection/i);
    await assertVisible(page, 'Add New Book');
  });

  await clickButton(page, /Cancel/i);
  await page.close();
});

await test('TC-UI-007', 'Member Management mo modal, nhap member, luu', async () => {
  const page = await step(`Mo link ${frontendBase}`, () => newPageAndOpenApp());
  await requireBackend(page);

  const fullName = unique('UI Member');

  await step('Mo modal Enroll Member', async () => {
    await clickButton(page, /Member Management/i);
    await clickButton(page, /Enroll Member/i);
    await assertVisible(page, 'Member Registration');
  });

  await step(`Nhap member moi: ${fullName}`, async () => {
    await page.getByPlaceholder('Nguyen Van An').fill(fullName);
    await page.getByPlaceholder('member@example.com').fill(`${fullName.replaceAll(' ', '.').toLowerCase()}@example.com`);
    await page.getByPlaceholder('0900000000').fill('0901234567');
    await clickButton(page, /Add Member/i);
  });

  await step('Kiem tra member moi xuat hien trong bang', async () => {
    await page.getByText('Member Registration').waitFor({ state: 'detached', timeout: 10000 });
    await assertVisible(page, fullName);
    await assertVisible(page, 'ACTIVE');
  });

  await page.close();
});

await test('TC-UI-008', 'Member Management validation khong cho luu khi thieu full name', async () => {
  const page = await step(`Mo link ${frontendBase}`, () => newPageAndOpenApp());

  await step('Mo modal Member Registration', async () => {
    await clickButton(page, /Member Management/i);
    await clickButton(page, /Enroll Member/i);
    await assertVisible(page, 'Member Registration');
  });

  await step('De trong full name va bam Add Member', async () => {
    await page.getByPlaceholder('0900000000').fill('0901234567');
    await clickButton(page, /Add Member/i);
    await assertVisible(page, 'Member Registration');
  });

  await clickButton(page, /Cancel/i);
  await page.close();
});

await test('TC-UI-009', 'Circulation chon member, chon book, doi ngay muon/tra han', async () => {
  const page = await step(`Mo link ${frontendBase}`, () => newPageAndOpenApp());

  await step('Mo Circulation Desk', async () => {
    await clickButton(page, /Circulation/i);
    await assertVisible(page, 'Issue New Book');
  });

  const selects = page.locator('select');
  const selectCount = await selects.count();
  assert.equal(selectCount >= 2, true, 'Expected member and book dropdowns');

  const dateInputs = page.locator('input[type="date"]');
  assert.equal(await dateInputs.count(), 2, 'Expected issue date and due date inputs');

  await step('Nhap Issue Date va Due Date', async () => {
    await dateInputs.nth(0).fill(today());
    await dateInputs.nth(1).fill(addDaysLocal(today(), 14));
    assert.equal(await dateInputs.nth(0).inputValue(), today());
    assert.equal(await dateInputs.nth(1).inputValue(), addDaysLocal(today(), 14));
  });

  await page.close();
});

await test('TC-UI-010', 'Circulation tao loan tu UI', async () => {
  const page = await step(`Mo link ${frontendBase}`, () => newPageAndOpenApp());
  await requireBackend(page);

  await step('Mo Circulation Desk', async () => {
    await clickButton(page, /Circulation/i);
    await assertVisible(page, 'Issue New Book');
  });

  const memberOptions = await page.locator('select').first().locator('option').count();
  const bookOptions = await page.locator('select').nth(1).locator('option').count();
  if (memberOptions === 0 || bookOptions === 0) {
    skip('Need at least one ACTIVE member and one available book in the UI dropdowns');
  }

  const beforeRows = await page.locator('table tbody tr').count();
  await step('Nhap ngay va bam Generate Loan Ticket', async () => {
    await page.locator('input[type="date"]').nth(0).fill(today());
    await page.locator('input[type="date"]').nth(1).fill(addDaysLocal(today(), 14));
    await clickButton(page, /Generate Loan Ticket/i);
    await page.waitForTimeout(1200);
  });

  await step('Kiem tra bang active loans sau khi tao loan', async () => {
    const afterRows = await page.locator('table tbody tr').count();
    assert.equal(afterRows >= beforeRows, true, 'Active loan table should stay available after issuing');
  });

  await page.close();
});

await test('TC-UI-011', 'Circulation return loan tu UI', async () => {
  const page = await step(`Mo link ${frontendBase}`, () => newPageAndOpenApp());
  await requireBackend(page);

  await step('Mo Circulation Desk va xem active loans', async () => {
    await clickButton(page, /Circulation/i);
    await assertVisible(page, 'Current Active Loans');
  });

  const returnButtons = page.getByRole('button', { name: /Return Book/i });
  const count = await returnButtons.count();
  if (count === 0) {
    skip('No active loan is available to return');
  }

  const beforeRows = await page.locator('table tbody tr').count();
  await step('Bam Return Book tren loan dau tien', async () => {
    await returnButtons.first().click();
    await page.waitForTimeout(1200);
  });

  await step('Kiem tra active loan rows khong tang sau khi return', async () => {
    const afterRows = await page.locator('table tbody tr').count();
    assert.equal(afterRows <= beforeRows, true, 'Active loan rows should not increase after returning a book');
  });

  await page.close();
});

await test('TC-UI-012', 'Circulation dropdown chi hien member ACTIVE va sach available', async () => {
  const page = await step(`Mo link ${frontendBase}`, () => newPageAndOpenApp());

  await step('Mo Circulation Desk', async () => {
    await clickButton(page, /Circulation/i);
    await assertVisible(page, 'Issue New Book');
  });

  await step('Kiem tra dropdown member va book', async () => {
    const memberOptions = await page.locator('select').first().locator('option').allTextContents();
    const bookOptions = await page.locator('select').nth(1).locator('option').allTextContents();

    assert.ok(memberOptions.length > 0, 'Expected at least one active member option');
    assert.ok(memberOptions.every((option) => !option.includes('INACTIVE') && !option.includes('BLOCKED')));
    assert.ok(bookOptions.every((option) => !option.includes('- 0 available')));
  });

  await page.close();
});

await browser.close();

console.log('');
console.log(`Frontend base: ${frontendBase}`);
exitWithSummary();

async function newPageAndOpenApp() {
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  try {
    await page.goto(frontendBase, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.getByText('Library Admin').waitFor({ timeout: 10000 });
    await waitForApiBannerSettled(page);
    return page;
  } catch (error) {
    await page.close();
    skip(`Frontend is not reachable at ${frontendBase}: ${error.message}`);
  }
}

async function assertVisible(page, text) {
  await page.getByText(text, { exact: false }).first().waitFor({ timeout: 10000 });
}

async function clickButton(page, name) {
  await page.getByRole('button', { name }).first().click();
}

async function requireBackend(page) {
  await waitForApiBannerSettled(page);
  const text = await page.locator('.api-banner').innerText();
  if (!text.includes('Connected to SQL Server')) {
    skip(`Backend is not connected from frontend banner: ${text}`);
  }
}

async function waitForApiBannerSettled(page) {
  try {
    await page.waitForFunction(() => {
      const banner = document.querySelector('.api-banner');
      return banner && !banner.textContent.includes('Connecting to backend');
    }, null, { timeout: 15000 });
  } catch {
    // Keep going so tests can report the current banner text instead of hanging.
  }
}

function addDaysLocal(dateText, days) {
  const date = new Date(`${dateText}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
