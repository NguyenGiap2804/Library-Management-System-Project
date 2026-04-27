import {
  addDays,
  apiBase,
  apiGet,
  apiPost,
  assert,
  exitWithSummary,
  expectOk,
  expectRejected,
  skip,
  test,
  today,
  unique,
} from './test-harness.mjs';

let books = [];
let members = [];
let activeMember = null;
let inactiveMember = null;
let blockedMember = null;
let createdMember = null;
let borrowableBook = null;
let createdBorrowRecord = null;

async function reloadReferenceData() {
  const bookResult = await apiGet('/books');
  const memberResult = await apiGet('/members');
  expectOk(bookResult, 'GET /books');
  expectOk(memberResult, 'GET /members');
  books = bookResult.body;
  members = memberResult.body;
  activeMember = members.find((member) => member.status === 'ACTIVE') || null;
  inactiveMember = members.find((member) => member.status === 'INACTIVE') || null;
  blockedMember = members.find((member) => member.status === 'BLOCKED') || null;
  borrowableBook = books.find((book) => book.availableQuantity > 0) || null;
}

await test('TC-API-001', 'Health check thanh cong', async () => {
  const result = await apiGet('/health');
  expectOk(result, 'GET /health');
  assert.deepEqual(result.body, { status: 'ok' });
});

await test('TC-API-003', 'Lay danh sach sach', async () => {
  const result = await apiGet('/books');
  expectOk(result, 'GET /books');
  assert.equal(Array.isArray(result.body), true);
  assert.ok(result.body.length > 0, 'Expected at least one book');
  for (let index = 1; index < result.body.length; index += 1) {
    assert.ok(result.body[index].id >= result.body[index - 1].id, 'Books should be sorted by id');
  }
});

await test('TC-API-011', 'Lay danh sach thanh vien', async () => {
  const result = await apiGet('/members');
  expectOk(result, 'GET /members');
  assert.equal(Array.isArray(result.body), true);
  assert.ok(result.body.length > 0, 'Expected at least one member');
  assert.ok(result.body.every((member) => ['ACTIVE', 'INACTIVE', 'BLOCKED'].includes(member.status)));
});

await test('TC-API-002', 'Lay dashboard stats', async () => {
  await reloadReferenceData();
  const activeLoans = await apiGet('/borrow-records/active');
  expectOk(activeLoans, 'GET /borrow-records/active');

  const stats = await apiGet('/stats');
  expectOk(stats, 'GET /stats');

  const expectedTotalBooks = books.reduce((sum, book) => sum + book.totalQuantity, 0);
  const expectedOverdue = activeLoans.body.filter((record) => record.status === 'OVERDUE').length;

  assert.equal(stats.body.totalBooks, expectedTotalBooks);
  assert.equal(stats.body.totalMembers, members.length);
  assert.equal(stats.body.borrowedBooks, activeLoans.body.length);
  assert.equal(stats.body.overdueBooks, expectedOverdue);
});

await test('TC-API-004', 'Tim sach theo keyword co ket qua', async () => {
  const result = await apiGet('/books?q=Java');
  expectOk(result, 'GET /books?q=Java');
  assert.equal(Array.isArray(result.body), true);
  assert.ok(result.body.length > 0, 'Expected Java search to return seeded data');
  assert.ok(
    result.body.every((book) => `${book.title} ${book.author} ${book.subject}`.toLowerCase().includes('java')),
    'Each returned book should match title, author, or subject',
  );
});

await test('TC-API-005', 'Tim sach keyword khong ton tai', async () => {
  const result = await apiGet(`/books?q=${encodeURIComponent(unique('__NO_BOOK_RESULT__'))}`);
  expectOk(result, 'GET /books with no-result keyword');
  assert.deepEqual(result.body, []);
});

await test('TC-API-006', 'Them sach hop le', async () => {
  const result = await apiPost('/books', {
    title: unique('Clean Code QA'),
    author: 'QA Author',
    subject: 'Software Engineering',
    totalQuantity: 3,
  });
  expectOk(result, 'POST /books valid payload');
  assert.equal(result.body.totalQuantity, 3);
  assert.equal(result.body.availableQuantity, 3);
});

await test('TC-API-007', 'Them sach voi quantity = 0', async () => {
  const result = await apiPost('/books', {
    title: unique('Zero Copy Book'),
    author: 'QA',
    subject: 'Java',
    totalQuantity: 0,
  });
  expectOk(result, 'POST /books quantity 0');
  assert.equal(result.body.totalQuantity, 0);
  assert.equal(result.body.availableQuantity, 0);
});

await test('TC-API-008', 'Them sach voi quantity am', async () => {
  const result = await apiPost('/books', {
    title: unique('Invalid Book'),
    author: 'QA',
    subject: 'Java',
    totalQuantity: -1,
  });
  expectRejected(result, 'POST /books negative quantity');
});

await test('TC-API-009', 'Them sach thieu title', async () => {
  const result = await apiPost('/books', {
    title: ' ',
    author: 'QA',
    subject: 'Java',
    totalQuantity: 1,
  });
  expectRejected(result, 'POST /books blank title');
});

await test('TC-API-010', 'Them sach thieu subject', async () => {
  const result = await apiPost('/books', {
    title: unique('Book Without Subject'),
    author: 'QA',
    subject: ' ',
    totalQuantity: 1,
  });
  expectRejected(result, 'POST /books blank subject');
});

await test('TC-API-012', 'Them member hop le', async () => {
  const code = `QA${Date.now().toString().slice(-10)}`;
  const result = await apiPost('/members', {
    code,
    fullName: 'Nguyen Van QA',
    phone: '0900000000',
  });
  expectOk(result, 'POST /members valid payload');
  assert.equal(result.body.code, code);
  assert.equal(result.body.status, 'ACTIVE');
  createdMember = result.body;
});

await test('TC-API-013', 'Them member thieu code', async () => {
  const result = await apiPost('/members', {
    code: ' ',
    fullName: 'Nguyen Van QA',
    phone: '0900000000',
  });
  expectRejected(result, 'POST /members blank code');
});

await test('TC-API-014', 'Them member duplicate code', async () => {
  const code = `QD${Date.now().toString().slice(-10)}`;
  const first = await apiPost('/members', {
    code,
    fullName: 'Duplicate Base',
    phone: '0900000000',
  });
  expectOk(first, 'POST /members duplicate setup');

  const duplicate = await apiPost('/members', {
    code,
    fullName: 'Duplicate Attempt',
    phone: '0900000001',
  });
  expectRejected(duplicate, 'POST /members duplicate code');
});

await test('TC-API-015', 'Them member phone rong', async () => {
  const result = await apiPost('/members', {
    code: `QP${Date.now().toString().slice(-10)}`,
    fullName: 'Phone Optional',
    phone: '',
  });
  expectOk(result, 'POST /members empty phone');
  assert.equal(result.body.status, 'ACTIVE');
});

await test('TC-API-016', 'Lay active borrow records', async () => {
  const result = await apiGet('/borrow-records/active');
  expectOk(result, 'GET /borrow-records/active');
  assert.equal(Array.isArray(result.body), true);
  assert.ok(result.body.every((record) => ['BORROWED', 'OVERDUE'].includes(record.status)));
});

await test('TC-API-017', 'Muon sach hop le', async () => {
  await reloadReferenceData();
  if (!activeMember || !borrowableBook) skip('Need ACTIVE member and available book');

  const beforeAvailable = borrowableBook.availableQuantity;
  const borrowDate = today();
  const result = await apiPost('/borrow-records', {
    bookId: borrowableBook.id,
    memberId: activeMember.id,
    borrowDate,
    dueDate: addDays(borrowDate, 14),
  });
  expectOk(result, 'POST /borrow-records valid payload');
  assert.equal(result.body.status, 'BORROWED');
  createdBorrowRecord = result.body;

  const refreshedBooks = await apiGet('/books');
  expectOk(refreshedBooks, 'GET /books after borrow');
  const refreshedBook = refreshedBooks.body.find((book) => book.id === borrowableBook.id);
  assert.equal(refreshedBook.availableQuantity, beforeAvailable - 1);
});

await test('TC-API-018', 'Muon sach voi dueDate bang borrowDate', async () => {
  await reloadReferenceData();
  if (!activeMember || !borrowableBook) skip('Need ACTIVE member and available book');

  const borrowDate = today();
  const result = await apiPost('/borrow-records', {
    bookId: borrowableBook.id,
    memberId: activeMember.id,
    borrowDate,
    dueDate: borrowDate,
  });
  expectOk(result, 'POST /borrow-records dueDate equals borrowDate');
  assert.equal(result.body.status, 'BORROWED');
});

await test('TC-API-019', 'Muon sach dueDate truoc borrowDate', async () => {
  await reloadReferenceData();
  if (!activeMember || !borrowableBook) skip('Need ACTIVE member and available book');

  const borrowDate = today();
  const result = await apiPost('/borrow-records', {
    bookId: borrowableBook.id,
    memberId: activeMember.id,
    borrowDate,
    dueDate: addDays(borrowDate, -1),
  });
  expectRejected(result, 'POST /borrow-records invalid date range');
});

await test('TC-API-020', 'Muon sach het hang', async () => {
  await reloadReferenceData();
  if (!activeMember) skip('Need ACTIVE member');

  const zeroBook = await apiPost('/books', {
    title: unique('Out Of Stock'),
    author: 'QA',
    subject: 'Database',
    totalQuantity: 0,
  });
  expectOk(zeroBook, 'POST /books out-of-stock setup');

  const result = await apiPost('/borrow-records', {
    bookId: zeroBook.body.id,
    memberId: activeMember.id,
    borrowDate: today(),
    dueDate: addDays(today(), 7),
  });
  expectRejected(result, 'POST /borrow-records out-of-stock book');
});

await test('TC-API-021', 'Muon sach voi member INACTIVE', async () => {
  await reloadReferenceData();
  if (!inactiveMember || !borrowableBook) skip('Need INACTIVE member and available book from seed data');

  const result = await apiPost('/borrow-records', {
    bookId: borrowableBook.id,
    memberId: inactiveMember.id,
    borrowDate: today(),
    dueDate: addDays(today(), 7),
  });
  expectRejected(result, 'POST /borrow-records inactive member');
});

await test('TC-API-022', 'Muon sach voi member BLOCKED', async () => {
  await reloadReferenceData();
  if (!blockedMember || !borrowableBook) skip('Need BLOCKED member and available book from seed data');

  const result = await apiPost('/borrow-records', {
    bookId: borrowableBook.id,
    memberId: blockedMember.id,
    borrowDate: today(),
    dueDate: addDays(today(), 7),
  });
  expectRejected(result, 'POST /borrow-records blocked member');
});

await test('TC-API-023', 'Muon sach voi bookId khong ton tai', async () => {
  await reloadReferenceData();
  if (!activeMember) skip('Need ACTIVE member');

  const result = await apiPost('/borrow-records', {
    bookId: 999999999,
    memberId: activeMember.id,
    borrowDate: today(),
    dueDate: addDays(today(), 7),
  });
  expectRejected(result, 'POST /borrow-records unknown book');
});

await test('TC-API-024', 'Muon sach voi memberId khong ton tai', async () => {
  await reloadReferenceData();
  if (!borrowableBook) skip('Need available book');

  const result = await apiPost('/borrow-records', {
    bookId: borrowableBook.id,
    memberId: 999999999,
    borrowDate: today(),
    dueDate: addDays(today(), 7),
  });
  expectRejected(result, 'POST /borrow-records unknown member');
});

await test('TC-API-025', 'Tra sach hop le tu BORROWED', async () => {
  if (!createdBorrowRecord) {
    await reloadReferenceData();
    if (!activeMember || !borrowableBook) skip('Need ACTIVE member and available book');
    const borrowDate = today();
    const setup = await apiPost('/borrow-records', {
      bookId: borrowableBook.id,
      memberId: activeMember.id,
      borrowDate,
      dueDate: addDays(borrowDate, 7),
    });
    expectOk(setup, 'POST /borrow-records return setup');
    createdBorrowRecord = setup.body;
  }

  const result = await apiPost('/returns', {
    borrowRecordId: createdBorrowRecord.id,
    returnDate: today(),
  });
  expectOk(result, 'POST /returns valid BORROWED record');
  assert.equal(result.body.status, 'RETURNED');
  assert.equal(result.body.returnDate, today());
});

await test('TC-API-027', 'Tra lai phieu da RETURNED', async () => {
  if (!createdBorrowRecord) skip('Need returned borrow record from previous test');
  const result = await apiPost('/returns', {
    borrowRecordId: createdBorrowRecord.id,
    returnDate: today(),
  });
  expectRejected(result, 'POST /returns already returned record');
});

await test('TC-API-028', 'Tra sach voi borrowRecordId khong ton tai', async () => {
  const result = await apiPost('/returns', {
    borrowRecordId: 999999999,
    returnDate: today(),
  });
  expectRejected(result, 'POST /returns unknown borrow record');
});

await test('TC-API-029', 'Lay return book records', async () => {
  const result = await apiGet('/return-books');
  expectOk(result, 'GET /return-books');
  assert.equal(Array.isArray(result.body), true);
  if (result.body.length > 0) {
    assert.ok(result.body[0].borrowRecord);
    assert.ok(Object.hasOwn(result.body[0], 'returnStatus'));
    assert.ok(Object.hasOwn(result.body[0], 'fineAmount'));
  }
});

await test('TC-EDGE-003', 'ReturnDate truoc BorrowDate bi tu choi', async () => {
  await reloadReferenceData();
  if (!activeMember || !borrowableBook) skip('Need ACTIVE member and available book');

  const borrowDate = today();
  const setup = await apiPost('/borrow-records', {
    bookId: borrowableBook.id,
    memberId: activeMember.id,
    borrowDate,
    dueDate: addDays(borrowDate, 7),
  });
  expectOk(setup, 'POST /borrow-records invalid return setup');

  const result = await apiPost('/returns', {
    borrowRecordId: setup.body.id,
    returnDate: addDays(borrowDate, -1),
  });
  expectRejected(result, 'POST /returns returnDate before borrowDate');
});

await test('TC-EDGE-005', 'Payload JSON sai kieu date bi tu choi', async () => {
  await reloadReferenceData();
  if (!activeMember || !borrowableBook) skip('Need ACTIVE member and available book');

  const result = await apiPost('/borrow-records', {
    bookId: borrowableBook.id,
    memberId: activeMember.id,
    borrowDate: '27-04-2026',
    dueDate: '2026-05-11',
  });
  expectRejected(result, 'POST /borrow-records invalid date format');
});

await test('TC-EDGE-006', 'Payload JSON thieu borrowDate bi tu choi', async () => {
  await reloadReferenceData();
  if (!activeMember || !borrowableBook) skip('Need ACTIVE member and available book');

  const result = await apiPost('/borrow-records', {
    bookId: borrowableBook.id,
    memberId: activeMember.id,
    dueDate: addDays(today(), 7),
  });
  expectRejected(result, 'POST /borrow-records missing borrowDate');
});

console.log('');
console.log(`API base: ${apiBase}`);
exitWithSummary();
