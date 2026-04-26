import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle,
  ArrowLeftRight,
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  CircleHelp,
  Edit3,
  Filter,
  Library,
  LogOut,
  MoreVertical,
  Plus,
  PlusSquare,
  Search,
  Settings,
  Trash2,
  Undo2,
  Users,
  X,
} from 'lucide-react';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const fallbackBooks = [
  { id: 1, title: 'Library Book 001', author: 'Author 1', category: 'Software Engineering', isbn: '978-0-000001-LMS', quantity: 6, available: 5 },
  { id: 2, title: 'Library Book 002', author: 'Author 2', category: 'Java', isbn: '978-0-000002-LMS', quantity: 7, available: 6 },
  { id: 3, title: 'Library Book 003', author: 'Author 3', category: 'Database', isbn: '978-0-000003-LMS', quantity: 8, available: 8 },
  { id: 4, title: 'Library Book 004', author: 'Author 4', category: 'Networking', isbn: '978-0-000004-LMS', quantity: 9, available: 8 },
];

const fallbackMembers = [
  { id: 1, code: 'M001', name: 'Demo Member 001', email: 'member001@example.com', phone: '0900000001', joinDate: '2026-04-25', status: 'ACTIVE' },
  { id: 2, code: 'M002', name: 'Demo Member 002', email: 'member002@example.com', phone: '0900000002', joinDate: '2026-04-24', status: 'ACTIVE' },
  { id: 3, code: 'M010', name: 'Demo Member 010', email: 'member010@example.com', phone: '0900000010', joinDate: '2026-04-16', status: 'INACTIVE' },
];

const fallbackLoans = [
  { id: 1, memberId: 1, bookId: 1, borrowed: '2026-04-20', due: '2026-05-04', status: 'BORROWED' },
  { id: 2, memberId: 2, bookId: 2, borrowed: '2026-04-18', due: '2026-05-02', status: 'BORROWED' },
  { id: 3, memberId: 3, bookId: 4, borrowed: '2026-03-28', due: '2026-04-11', status: 'OVERDUE' },
];

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'books', label: 'Book Management', icon: BookOpen },
  { id: 'members', label: 'Member Management', icon: Users },
  { id: 'circulation', label: 'Circulation', icon: ArrowLeftRight },
];

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [books, setBooks] = useState(fallbackBooks);
  const [members, setMembers] = useState(fallbackMembers);
  const [loans, setLoans] = useState(fallbackLoans);
  const [stats, setStats] = useState(null);
  const [apiStatus, setApiStatus] = useState('Connecting to backend...');
  const [bookQuery, setBookQuery] = useState('');
  const [globalQuery, setGlobalQuery] = useState('');
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', category: 'Java', isbn: '', quantity: 1 });
  const [newMember, setNewMember] = useState({ name: '', email: '', phone: '' });
  const [loanForm, setLoanForm] = useState({
    memberId: String(fallbackMembers[0].id),
    bookId: String(fallbackBooks[0].id),
    borrowed: today(),
    due: addDays(new Date(), 14),
  });

  async function loadData() {
    try {
      const [bookRows, memberRows, activeLoanRows, statData] = await Promise.all([
        apiGet('/books'),
        apiGet('/members'),
        apiGet('/borrow-records/active'),
        apiGet('/stats'),
      ]);
      const mappedBooks = bookRows.map(mapBook);
      const mappedMembers = memberRows.map(mapMember);
      const mappedLoans = activeLoanRows.map(mapLoan);
      setBooks(mappedBooks);
      setMembers(mappedMembers);
      setLoans(mappedLoans);
      setStats(statData);
      setApiStatus(`Connected to SQL Server through backend API (${mappedBooks.length} books)`);
      setLoanForm((current) => ({
        ...current,
        memberId: String(mappedMembers.find((member) => member.status === 'ACTIVE')?.id || mappedMembers[0]?.id || ''),
        bookId: String(mappedBooks.find((book) => book.available > 0)?.id || mappedBooks[0]?.id || ''),
      }));
    } catch (error) {
      setApiStatus(`Backend API unavailable, showing local fallback data. ${error.message}`);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const activeLoans = loans.filter((loan) => loan.status !== 'RETURNED');
  const overdueLoans = activeLoans.filter((loan) => loan.status === 'OVERDUE');

  const dashboardStats = useMemo(() => {
    const totalCopies = books.reduce((sum, book) => sum + book.quantity, 0);
    return {
      totalCopies: stats?.totalBooks ?? totalCopies,
      members: stats?.totalMembers ?? members.length,
      borrowed: stats?.borrowedBooks ?? activeLoans.length,
      overdue: stats?.overdueBooks ?? overdueLoans.length,
    };
  }, [books, members.length, activeLoans.length, overdueLoans.length, stats]);

  const filteredBooks = books.filter((book) => {
    const q = bookQuery.trim().toLowerCase();
    return !q || [book.title, book.author, book.category, book.isbn].some((value) => String(value).toLowerCase().includes(q));
  });

  async function addBook() {
    if (!newBook.title.trim() || !newBook.author.trim()) return;
    await apiPost('/books', {
      title: newBook.title.trim(),
      author: newBook.author.trim(),
      subject: newBook.category,
      totalQuantity: Number(newBook.quantity) || 1,
    });
    setNewBook({ title: '', author: '', category: 'Java', isbn: '', quantity: 1 });
    setBookModalOpen(false);
    await loadData();
  }

  async function addMember() {
    if (!newMember.name.trim()) return;
    await apiPost('/members', {
      code: `M${Date.now().toString().slice(-6)}`,
      fullName: newMember.name.trim(),
      phone: newMember.phone.trim(),
    });
    setNewMember({ name: '', email: '', phone: '' });
    setMemberModalOpen(false);
    await loadData();
  }

  async function issueLoan() {
    await apiPost('/borrow-records', {
      bookId: Number(loanForm.bookId),
      memberId: Number(loanForm.memberId),
      borrowDate: loanForm.borrowed,
      dueDate: loanForm.due,
    });
    await loadData();
  }

  async function returnLoan(loanId) {
    await apiPost('/returns', {
      borrowRecordId: loanId,
      returnDate: today(),
    });
    await loadData();
  }

  const activity = activeLoans.slice(0, 3).map((loan) => {
    const book = books.find((item) => item.id === loan.bookId);
    const member = members.find((item) => item.id === loan.memberId);
    return {
      icon: loan.status === 'OVERDUE' ? AlertTriangle : BookOpen,
      title: book?.title || 'Unknown book',
      detail: loan.status === 'OVERDUE' ? 'Overdue Alert' : 'Borrow Request',
      member: member?.name || 'Unknown member',
      time: loan.borrowed,
      status: loan.status === 'OVERDUE' ? 'URGENT' : 'COMPLETED',
    };
  });

  return (
    <div className="app-shell">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="workspace">
        <Topbar query={globalQuery} setQuery={setGlobalQuery} />
        <div className="api-banner">{apiStatus}</div>
        {activeSection === 'dashboard' && (
          <Dashboard stats={dashboardStats} activity={activity} setActiveSection={setActiveSection} />
        )}
        {activeSection === 'books' && (
          <BooksView books={filteredBooks} query={bookQuery} setQuery={setBookQuery} openModal={() => setBookModalOpen(true)} />
        )}
        {activeSection === 'members' && (
          <MembersView members={members} openModal={() => setMemberModalOpen(true)} />
        )}
        {activeSection === 'circulation' && (
          <CirculationView
            books={books}
            members={members}
            loans={activeLoans}
            loanForm={loanForm}
            setLoanForm={setLoanForm}
            issueLoan={issueLoan}
            returnLoan={returnLoan}
          />
        )}
      </main>
      {bookModalOpen && <BookModal book={newBook} setBook={setNewBook} onClose={() => setBookModalOpen(false)} onSave={addBook} />}
      {memberModalOpen && <MemberModal member={newMember} setMember={setNewMember} onClose={() => setMemberModalOpen(false)} onSave={addMember} />}
    </div>
  );
}

function Sidebar({ activeSection, setActiveSection }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Library size={21} /></div>
        <div><div className="brand-title">Library Admin</div><div className="brand-subtitle">Main Branch</div></div>
      </div>
      <nav className="nav-list">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`nav-item ${activeSection === id ? 'active' : ''}`} onClick={() => setActiveSection(id)}>
            <Icon size={17} /><span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="nav-item"><Settings size={17} /><span>Settings</span></button>
        <button className="nav-item danger"><LogOut size={17} /><span>Logout</span></button>
      </div>
    </aside>
  );
}

function Topbar({ query, setQuery }) {
  return (
    <header className="topbar">
      <div className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search catalog, members, or loans..." /></div>
      <div className="topbar-actions">
        <button className="icon-button flagged"><Bell size={18} /></button>
        <button className="icon-button"><CircleHelp size={18} /></button>
        <div className="divider" />
        <div className="profile"><div className="profile-text"><strong>Admin User</strong><span>Chief Librarian</span></div><div className="avatar">AU</div></div>
      </div>
    </header>
  );
}

function Dashboard({ stats, activity, setActiveSection }) {
  return (
    <section className="content-panel">
      <div className="page-heading">
        <div><h1>System Overview</h1><p>Welcome back. Here's what's happening today at Main Branch.</p></div>
        <div className="heading-actions">
          <button className="secondary-button"><CalendarDays size={16} />This Week</button>
          <button className="primary-button" onClick={() => setActiveSection('circulation')}><Plus size={16} />New Loan</button>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard icon={BookOpen} label="Total Books" value={stats.totalCopies.toLocaleString()} tone="blue" />
        <StatCard icon={BadgeCheck} label="Total Members" value={stats.members} tone="green" />
        <StatCard icon={ArrowLeftRight} label="Books Borrowed" value={stats.borrowed} tone="amber" />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdue} tone="red" />
      </div>
      <div className="dashboard-grid">
        <section className="card activity-card">
          <div className="card-header"><h2>Recent Activity</h2><button>View All</button></div>
          <table className="data-table">
            <thead><tr><th>Transaction</th><th>Member</th><th>Time</th><th>Status</th></tr></thead>
            <tbody>
              {activity.map((item) => (
                <tr key={`${item.title}-${item.member}-${item.status}`}>
                  <td><div className="table-title"><span className={`mini-icon ${item.status.toLowerCase().replace(' ', '-')}`}><item.icon size={15} /></span><div><strong>{item.title}</strong><span>{item.detail}</span></div></div></td>
                  <td>{item.member}</td><td>{item.time}</td><td><StatusPill status={item.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <aside className="insights">
          <section className="target-card"><h2>Weekly Target</h2><p>Loan volume compared to last week</p><div className="target-row"><strong>78%</strong><span>+12%</span></div><div className="progress"><div /></div></section>
          <section className="card genre-card">
            <div className="card-header compact"><h2>Popular Genres</h2><BarChart3 size={18} /></div>
            <GenreRow color="blue" label="Fiction" value="45%" /><GenreRow color="green" label="History" value="22%" /><GenreRow color="amber" label="Science" value="18%" />
          </section>
        </aside>
      </div>
    </section>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={21} /></div><div><span>{label}</span><strong>{value}</strong></div></div>;
}

function BooksView({ books, query, setQuery, openModal }) {
  return (
    <section className="content-panel">
      <div className="page-heading"><div><h1>Inventory Catalog</h1><p>Manage your collection from SQL Server.</p></div><button className="primary-button" onClick={openModal}><PlusSquare size={16} />Register New Book</button></div>
      <div className="card table-card">
        <div className="table-toolbar"><div className="search-box inline"><Filter size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter by title, author, category, or ISBN..." /></div></div>
        <table className="data-table large">
          <thead><tr><th>Book Details</th><th>Category</th><th>Stock</th><th>Availability</th><th>Actions</th></tr></thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td><strong>{book.title}</strong><span>{book.author} - {book.isbn}</span></td>
                <td>{book.category}</td><td>{book.quantity} Units</td>
                <td><span className={book.available > 5 ? 'available good' : 'available warning'}>{book.available} Available</span></td>
                <td className="actions"><button><Edit3 size={16} /></button><button><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MembersView({ members, openModal }) {
  return (
    <section className="content-panel">
      <div className="page-heading"><div><h1>Patron Directory</h1><p>View and manage library memberships from SQL Server.</p></div><button className="primary-button" onClick={openModal}><Users size={16} />Enroll Member</button></div>
      <div className="card table-card">
        <table className="data-table large">
          <thead><tr><th>Member Name</th><th>Contact Info</th><th>Joining Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td><div className="member-name"><div>{initials(member.name)}</div><span><strong>{member.name}</strong><small>{member.code}</small></span></div></td>
                <td><strong>{member.email}</strong><span>{member.phone || 'No phone'}</span></td>
                <td>{member.joinDate || '-'}</td><td><StatusPill status={member.status} /></td>
                <td className="actions"><button><MoreVertical size={17} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CirculationView({ books, members, loans, loanForm, setLoanForm, issueLoan, returnLoan }) {
  return (
    <section className="content-panel">
      <div className="page-heading single"><div><h1>Circulation Desk</h1><p>Issue and return books through the backend API.</p></div></div>
      <div className="circulation-grid">
        <section className="card form-card">
          <h2><BookOpen size={20} />Issue New Book</h2>
          <label>Select Member</label>
          <select value={loanForm.memberId} onChange={(event) => setLoanForm({ ...loanForm, memberId: event.target.value })}>
            {members.filter((member) => member.status === 'ACTIVE').map((member) => <option key={member.id} value={member.id}>{member.name} ({member.code})</option>)}
          </select>
          <label>Select Book</label>
          <select value={loanForm.bookId} onChange={(event) => setLoanForm({ ...loanForm, bookId: event.target.value })}>
            {books.filter((book) => book.available > 0).map((book) => <option key={book.id} value={book.id}>{book.title} - {book.available} available</option>)}
          </select>
          <div className="form-row">
            <span><label>Issue Date</label><input type="date" value={loanForm.borrowed} onChange={(event) => setLoanForm({ ...loanForm, borrowed: event.target.value })} /></span>
            <span><label>Due Date</label><input type="date" value={loanForm.due} onChange={(event) => setLoanForm({ ...loanForm, due: event.target.value })} /></span>
          </div>
          <button className="primary-button full" onClick={issueLoan}>Generate Loan Ticket</button>
        </section>
        <section className="card table-card">
          <div className="card-header"><h2>Current Active Loans</h2><div className="loan-badges"><span>ACTIVE: {loans.filter((loan) => loan.status === 'BORROWED').length}</span><span>OVERDUE: {loans.filter((loan) => loan.status === 'OVERDUE').length}</span></div></div>
          <table className="data-table large">
            <thead><tr><th>Patron & Book</th><th>Borrow Date</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {loans.map((loan) => {
                const member = members.find((item) => item.id === loan.memberId);
                const book = books.find((item) => item.id === loan.bookId);
                return (
                  <tr key={loan.id}>
                    <td><strong>{member?.name}</strong><span>{book?.title}</span></td>
                    <td>{loan.borrowed}</td><td className={loan.status === 'OVERDUE' ? 'danger-text' : ''}>{loan.due}</td>
                    <td><StatusPill status={loan.status} /></td>
                    <td><button className="secondary-button small" onClick={() => returnLoan(loan.id)}>Return Book</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>
    </section>
  );
}

function BookModal({ book, setBook, onClose, onSave }) {
  return (
    <Modal title="Add New Book" onClose={onClose} onSave={onSave} saveLabel="Save Collection">
      <label>Book Title</label><input value={book.title} onChange={(event) => setBook({ ...book, title: event.target.value })} placeholder="Enter book title" />
      <div className="form-row">
        <span><label>Author</label><input value={book.author} onChange={(event) => setBook({ ...book, author: event.target.value })} placeholder="Name" /></span>
        <span><label>Category</label><select value={book.category} onChange={(event) => setBook({ ...book, category: event.target.value })}><option>Java</option><option>Database</option><option>Software Engineering</option><option>Networking</option></select></span>
      </div>
      <label>Quantity</label><input type="number" min="1" value={book.quantity} onChange={(event) => setBook({ ...book, quantity: event.target.value })} />
    </Modal>
  );
}

function MemberModal({ member, setMember, onClose, onSave }) {
  return (
    <Modal title="Member Registration" onClose={onClose} onSave={onSave} saveLabel="Add Member">
      <div className="upload-row"><div><Plus size={20} /></div><span><strong>Upload Photo</strong><small>JPG or PNG, max 2MB</small></span></div>
      <label>Full Name</label><input value={member.name} onChange={(event) => setMember({ ...member, name: event.target.value })} placeholder="Nguyen Van An" />
      <label>Email Address</label><input type="email" value={member.email} onChange={(event) => setMember({ ...member, email: event.target.value })} placeholder="member@example.com" />
      <label>Phone Number</label><input value={member.phone} onChange={(event) => setMember({ ...member, phone: event.target.value })} placeholder="0900000000" />
    </Modal>
  );
}

function Modal({ title, children, onClose, onSave, saveLabel }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header"><h2>{title}</h2><button onClick={onClose}><X size={20} /></button></div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer"><button className="text-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={onSave}>{saveLabel}</button></div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  return <span className={`status-pill ${String(status).toLowerCase().replace(' ', '-')}`}>{status}</span>;
}

function GenreRow({ color, label, value }) {
  return <div className="genre-row"><span><i className={color} />{label}</span><strong>{value}</strong></div>;
}

async function apiGet(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  return response.json();
}

async function apiPost(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `${path} returned ${response.status}`);
  }
  return response.json();
}

function mapBook(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    category: row.subject || row.category,
    isbn: row.isbn || `BOOK-${row.id}`,
    quantity: row.totalQuantity,
    available: row.availableQuantity,
  };
}

function mapMember(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.fullName,
    email: row.email || `${row.code || 'member'}@library.local`,
    phone: row.phone,
    joinDate: row.joinDate,
    status: row.status,
  };
}

function mapLoan(row) {
  return {
    id: row.id,
    memberId: row.member.id,
    bookId: row.book.id,
    borrowed: row.borrowDate,
    due: row.dueDate,
    status: row.status,
  };
}

function initials(name = '') {
  return name.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'NA';
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

createRoot(document.getElementById('root')).render(<App />);
