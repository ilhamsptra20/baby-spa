"use client";

import {
  Bars3Icon,
  ChartBarSquareIcon,
  CheckCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  RectangleGroupIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";

import { Button, Card } from "@/ui/components/common";
import {
  Chart,
  DataTable,
  Pagination,
  Table,
  type DataTableColumn,
  type TableColumn,
} from "@/ui/components/data-display";
import { Alert } from "@/ui/components/feedback";
import {
  CurrencyInput,
  Input,
  PasswordInput,
  Select,
  Textarea,
  TextEditor,
} from "@/ui/components/form";
import { Header } from "@/ui/components/navigation";
import { Modal } from "@/ui/components/overlay";
import { PageTitle } from "@/ui/components/typography";
import { useToast } from "@/ui/hooks";
import { AuthLayout } from "@/ui/layouts/AuthLayout";
import { DashboardLayout } from "@/ui/layouts/DashboardLayout";
import { PublicLayout } from "@/ui/layouts/PublicLayout";

type FormsPageKind = "overview" | "input" | "select" | "text-editor";
type TablesPageKind = "overview" | "data-table" | "table" | "pagination";
type PagesPageKind = "overview" | "header" | "modal" | "toast";
type LayoutsPageKind = "overview" | "dashboard" | "auth" | "public";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  status: "Active" | "Pending" | "Suspended";
};

type InvoiceRow = {
  id: string;
  customer: string;
  status: "Paid" | "Pending" | "Overdue";
  amount: string;
};

const users: UserRow[] = [
  { id: "u-1", name: "Aditya Kusuma", email: "aditya@example.com", role: "Admin", status: "Active" },
  { id: "u-2", name: "Bella Putri", email: "bella@example.com", role: "Editor", status: "Pending" },
  { id: "u-3", name: "Chandra Bayu", email: "chandra@example.com", role: "Viewer", status: "Active" },
  { id: "u-4", name: "Dina Mahesa", email: "dina@example.com", role: "Editor", status: "Suspended" },
  { id: "u-5", name: "Eko Pramana", email: "eko@example.com", role: "Viewer", status: "Active" },
  { id: "u-6", name: "Fiona Laras", email: "fiona@example.com", role: "Admin", status: "Active" },
];

const invoices: InvoiceRow[] = [
  { id: "INV-1021", customer: "Alya Rahman", status: "Paid", amount: "Rp 4.250.000" },
  { id: "INV-1022", customer: "Bagas Prasetyo", status: "Pending", amount: "Rp 8.700.000" },
  { id: "INV-1023", customer: "Clara Wijaya", status: "Overdue", amount: "Rp 2.150.000" },
  { id: "INV-1024", customer: "Dimas Saputra", status: "Paid", amount: "Rp 11.400.000" },
];

const userColumns: DataTableColumn<UserRow>[] = [
  { key: "name", header: "Name", sortable: true, render: (row) => <span className="font-medium text-slate-900 dark:text-slate-100">{row.name}</span> },
  { key: "email", header: "Email", sortable: true },
  { key: "role", header: "Role", sortable: true, render: (row) => <Badge>{row.role}</Badge> },
  { key: "status", header: "Status", sortable: true, render: (row) => <StatusBadge status={row.status} /> },
];

const invoiceColumns: TableColumn<InvoiceRow>[] = [
  { key: "id", header: "Invoice", className: "font-medium text-slate-900 dark:text-slate-100" },
  { key: "customer", header: "Customer" },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  { key: "amount", header: "Amount", className: "text-right font-medium" },
];

const formCards = [
  { title: "Input", description: "Basic text, password, nominal, dan textarea untuk data entry.", href: "/forms/input" },
  { title: "Select", description: "Single atau multi option untuk status, role, dan kategori.", href: "/forms/select" },
  { title: "Text Editor", description: "Rich text sederhana untuk konten, note, dan template email.", href: "/forms/text-editor" },
];

const tableCards = [
  { title: "Data Table", description: "Search, filter, sorting, pagination, dan row action.", href: "/tables/data-table" },
  { title: "Table", description: "Primitive table untuk layout data yang lebih manual.", href: "/tables/table" },
  { title: "Pagination", description: "Navigation primitive untuk data client/server side.", href: "/tables/pagination" },
];

const pageCards = [
  { title: "Header", description: "Top bar dengan title, search command, theme, dan actions.", href: "/pages/header" },
  { title: "Modal", description: "Dialog untuk form pendek, confirmation, dan side panel.", href: "/pages/modal" },
  { title: "Toast", description: "Feedback non-blocking untuk success, warning, info, dan error.", href: "/pages/toast" },
];

const layoutCards = [
  { title: "Dashboard", description: "Layout internal app dengan sidebar, header, dan main content.", href: "/layouts/dashboard" },
  { title: "Auth", description: "Layout login/register dengan panel fokus.", href: "/layouts/auth" },
  { title: "Public", description: "Layout marketing atau public page dengan max-width content.", href: "/layouts/public" },
];

const dashboardSeries = [
  {
    name: "Visitors",
    color: "sky" as const,
    data: [
      { label: "Mon", value: 32 },
      { label: "Tue", value: 48 },
      { label: "Wed", value: 41 },
      { label: "Thu", value: 63 },
      { label: "Fri", value: 57 },
      { label: "Sat", value: 72 },
    ],
  },
  {
    name: "Leads",
    color: "emerald" as const,
    data: [
      { label: "Mon", value: 18 },
      { label: "Tue", value: 26 },
      { label: "Wed", value: 24 },
      { label: "Thu", value: 38 },
      { label: "Fri", value: 34 },
      { label: "Sat", value: 45 },
    ],
  },
];

function Badge({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: UserRow["status"] | InvoiceRow["status"] }) {
  const tone = {
    Active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    Paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    Pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    Suspended: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    Overdue: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  }[status];

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}

function LinkGrid({ items }: { items: Array<{ title: string; description: string; href: string }> }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <Card key={item.href}>
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
            <Link
              href={item.href}
              className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Open Page
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}

function TemplateMetric({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: typeof TableCellsIcon;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{helper}</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );
}

function TemplateMetrics() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <TemplateMetric label="Pages" value="16" helper="Semua route punya page sendiri" icon={RectangleGroupIcon} />
      <TemplateMetric label="Components" value="24+" helper="Dipakai sebagai flow app" icon={TableCellsIcon} />
      <TemplateMetric label="Patterns" value="8" helper="Form, table, modal, layout" icon={ChartBarSquareIcon} />
    </section>
  );
}

function UsageNotes({ items }: { items: string[] }) {
  return (
    <Card title="How to use this page" description="Pola penggunaan elemen yang ditunjukkan halaman ini.">
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950/60">
            <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            <p className="text-sm text-slate-600 dark:text-slate-300">{item}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function FormShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <DashboardLayout title="Forms" subtitle="Form pages memakai komponen app sendiri" headerActions={<Button size="sm"><PlusIcon className="h-4 w-4" />Create</Button>}>
      <div className="space-y-6">
        <PageTitle title={title} description={description} />
        {children}
      </div>
    </DashboardLayout>
  );
}

export function FormsTemplate({ kind }: { kind: FormsPageKind }) {
  const [team, setTeam] = useState("engineering");
  const [tags, setTags] = useState<string[]>(["finance"]);
  const [content, setContent] = useState("<p>Draft pengumuman untuk internal team.</p>");

  if (kind === "input") {
    return (
      <FormShell title="Input Page" description="Halaman form data entry, bukan docs.">
        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <Card title="Customer Form" description="Contoh form memakai komponen input yang tersedia.">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Full name" placeholder="Nadia Puspita" />
              <Input label="Email" type="email" placeholder="nadia@example.com" />
              <PasswordInput label="Password" value="Secret123!" onChange={() => undefined} />
              <CurrencyInput label="Budget" value="12500000" disabled />
              <Textarea label="Notes" placeholder="Catatan customer..." containerClassName="md:col-span-2" />
            </div>
          </Card>
          <Card title="Form State" description="Template summary untuk sidebar form.">
            <Alert tone="info" title="Ready to submit" description="Hubungkan value ke server action atau API route sesuai kebutuhan." />
          </Card>
        </section>
      </FormShell>
    );
  }

  if (kind === "select") {
    return (
      <FormShell title="Select Page" description="Halaman pilihan data dengan single dan multi select.">
        <Card title="Team Settings" description="Contoh select sebagai halaman operasional.">
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Team"
              value={team}
              onChange={setTeam}
              options={[
                { label: "Engineering", value: "engineering" },
                { label: "Product", value: "product" },
                { label: "Operations", value: "operations" },
              ]}
            />
            <Select
              multiple
              label="Tags"
              value={tags}
              onChange={setTags}
              options={[
                { label: "Finance", value: "finance" },
                { label: "Dashboard", value: "dashboard" },
                { label: "Urgent", value: "urgent" },
              ]}
            />
          </div>
        </Card>
      </FormShell>
    );
  }

  if (kind === "text-editor") {
    return (
      <FormShell title="Text Editor Page" description="Halaman editor konten internal.">
        <Card title="Announcement Editor" description="Contoh rich text editor sebagai page production.">
          <TextEditor label="Content" value={content} onChange={setContent} minHeight={260} />
        </Card>
      </FormShell>
    );
  }

  return (
    <FormShell title="Forms" description="Kumpulan halaman form app.">
      <TemplateMetrics />
      <LinkGrid items={formCards} />
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card title="Form Layout Preview" description="Contoh struktur form TailAdmin-style memakai element sendiri.">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Campaign name" placeholder="Q3 Launch" />
            <Select
              label="Status"
              value="draft"
              options={[
                { label: "Draft", value: "draft" },
                { label: "Published", value: "published" },
                { label: "Archived", value: "archived" },
              ]}
            />
            <CurrencyInput label="Budget" value="24000000" disabled />
            <Input label="Owner" placeholder="Marketing Team" />
            <Textarea label="Description" placeholder="Tulis deskripsi campaign..." containerClassName="md:col-span-2" />
          </div>
        </Card>
        <UsageNotes
          items={[
            "Pakai `Input`, `Select`, `CurrencyInput`, dan `Textarea` dalam grid responsif.",
            "Simpan value di page/hook saat field perlu interactive.",
            "Gunakan `error` dan `helperText` untuk state validasi yang konsisten.",
            "Pisahkan form action dari UI component agar reusable.",
          ]}
        />
      </section>
    </FormShell>
  );
}

function TablesShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <DashboardLayout title="Tables" subtitle="Table pages tanpa redirect ke docs" headerActions={<Button size="sm"><FunnelIcon className="h-4 w-4" />Filter</Button>}>
      <div className="space-y-6">
        <PageTitle title={title} description={description} />
        {children}
      </div>
    </DashboardLayout>
  );
}

export function TablesTemplate({ kind }: { kind: TablesPageKind }) {
  const [page, setPage] = useState(2);

  if (kind === "data-table") {
    return (
      <TablesShell title="Data Table Page" description="Halaman list user memakai DataTable internal.">
        <Card title="Users" description="Search, filter, sorting, dan pagination." contentClassName="p-0">
          <DataTable<UserRow>
            data={users}
            columns={userColumns}
            searchable
            filters={[
              {
                key: "role",
                label: "Role",
                options: [
                  { label: "Admin", value: "Admin" },
                  { label: "Editor", value: "Editor" },
                  { label: "Viewer", value: "Viewer" },
                ],
              },
            ]}
            paginated
            pageSize={3}
          />
        </Card>
      </TablesShell>
    );
  }

  if (kind === "table") {
    return (
      <TablesShell title="Table Page" description="Halaman invoice memakai Table primitive.">
        <Card title="Invoices" description="Primitive table untuk data sederhana." contentClassName="p-0">
          <Table<InvoiceRow> columns={invoiceColumns} data={invoices} rowKey="id" />
        </Card>
      </TablesShell>
    );
  }

  if (kind === "pagination") {
    return (
      <TablesShell title="Pagination Page" description="Halaman contoh pagination standalone.">
        <Card title="Result Navigation" description="Pagination primitive untuk list server/client side.">
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">Current page: {page}</p>
            <Pagination currentPage={page} totalPages={12} onPageChange={setPage} />
          </div>
        </Card>
      </TablesShell>
    );
  }

  return (
    <TablesShell title="Tables" description="Kumpulan halaman table app.">
      <TemplateMetrics />
      <LinkGrid items={tableCards} />
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card title="DataTable Preview" description="Search, filter, sorting, dan pagination dalam satu table." contentClassName="p-0">
          <DataTable<UserRow>
            data={users}
            columns={userColumns}
            searchable
            filters={[
              {
                key: "status",
                label: "Status",
                options: [
                  { label: "Active", value: "Active" },
                  { label: "Pending", value: "Pending" },
                  { label: "Suspended", value: "Suspended" },
                ],
              },
            ]}
            paginated
            pageSize={3}
          />
        </Card>
        <UsageNotes
          items={[
            "Gunakan `DataTable` untuk list admin cepat dengan filter internal.",
            "Gunakan `Table` primitive saat filtering/pagination dikontrol page.",
            "Kolom menerima render custom untuk badge, action, dan format nominal.",
            "Pagination bisa standalone untuk server-side data.",
          ]}
        />
      </section>
    </TablesShell>
  );
}

function PagesShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <DashboardLayout title="Pages" subtitle="Page patterns tanpa redirect docs" headerActions={<Button size="sm">Preview</Button>}>
      <div className="space-y-6">
        <PageTitle title={title} description={description} />
        {children}
      </div>
    </DashboardLayout>
  );
}

export function PagesTemplate({ kind }: { kind: PagesPageKind }) {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  if (kind === "header") {
    return (
      <PagesShell title="Header Page" description="Halaman contoh header app.">
        <Card title="Header Preview" description="Komponen Header dipakai langsung dalam frame konten." contentClassName="p-0">
          <div className="overflow-hidden rounded-b-xl">
            <Header
              title="Customers"
              subtitle="Manage customer data"
              actions={<Button size="sm"><PlusIcon className="h-4 w-4" />Add</Button>}
              className="relative top-auto"
            />
          </div>
        </Card>
      </PagesShell>
    );
  }

  if (kind === "modal") {
    return (
      <PagesShell title="Modal Page" description="Halaman contoh modal flow.">
        <Card title="Modal Action" description="Klik tombol untuk membuka modal.">
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Modal
            open={modalOpen}
            title="Create customer"
            description="Contoh modal sebagai page workflow."
            onClose={() => setModalOpen(false)}
            footer={<Button onClick={() => setModalOpen(false)}>Save</Button>}
          >
            <div className="space-y-4">
              <Input label="Customer name" placeholder="Alya Rahman" />
              <Input label="Email" type="email" placeholder="alya@example.com" />
            </div>
          </Modal>
        </Card>
      </PagesShell>
    );
  }

  if (kind === "toast") {
    return (
      <PagesShell title="Toast Page" description="Halaman contoh feedback toast.">
        <Card title="Toast Actions" description="Trigger toast dari flow halaman.">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => toast.success("Data berhasil disimpan")}>Success</Button>
            <Button variant="outline" onClick={() => toast.info("Sinkronisasi sedang berjalan")}>Info</Button>
            <Button variant="danger" onClick={() => toast.error("Gagal menyimpan data")}>Error</Button>
          </div>
        </Card>
      </PagesShell>
    );
  }

  return (
    <PagesShell title="Pages" description="Kumpulan halaman UI pattern app.">
      <TemplateMetrics />
      <LinkGrid items={pageCards} />
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="Operational Page Preview" description="Header, alert, actions, dan content block dalam satu halaman.">
          <div className="space-y-4">
            <Alert tone="success" title="System ready" description="Feedback page-level bisa pakai Alert atau Toast sesuai flow." />
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { label: "Notification", value: "12" },
                { label: "Messages", value: "48" },
                { label: "Open Tasks", value: "9" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => toast.success("Action success")}>Trigger Toast</Button>
              <Button variant="outline" onClick={() => setModalOpen(true)}>Open Modal</Button>
            </div>
          </div>
        </Card>
        <UsageNotes
          items={[
            "Gunakan `Header` untuk action bar halaman dashboard.",
            "Gunakan `Modal` untuk form pendek atau detail action.",
            "Gunakan `Toast` untuk feedback non-blocking.",
            "Gunakan `Alert` untuk state page-level yang perlu terlihat terus.",
          ]}
        />
      </section>
      <Modal
        open={modalOpen}
        title="Quick action"
        description="Modal ini dipanggil dari overview Pages."
        onClose={() => setModalOpen(false)}
        footer={<Button onClick={() => setModalOpen(false)}>Close</Button>}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">Contoh modal dalam page template.</p>
      </Modal>
    </PagesShell>
  );
}

function LayoutsShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <DashboardLayout title="Layouts" subtitle="Layout pages tanpa redirect docs" headerActions={<Button size="sm"><RectangleGroupIcon className="h-4 w-4" />Layout</Button>}>
      <div className="space-y-6">
        <PageTitle title={title} description={description} />
        {children}
      </div>
    </DashboardLayout>
  );
}

export function LayoutsTemplate({ kind }: { kind: LayoutsPageKind }) {
  if (kind === "dashboard") {
    return (
      <LayoutsShell title="Dashboard Layout Page" description="Contoh struktur dashboard layout.">
        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Sidebar", icon: Bars3Icon },
            { label: "Header", icon: MagnifyingGlassIcon },
            { label: "Content", icon: TableCellsIcon },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label}>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{item.label}</p>
                </div>
              </Card>
            );
          })}
        </section>
      </LayoutsShell>
    );
  }

  if (kind === "auth") {
    return (
      <LayoutsShell title="Auth Layout Page" description="Contoh auth layout dalam frame dashboard.">
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <AuthLayout>
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Sign in</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Masuk ke workspace.</p>
              </div>
              <Input label="Email" type="email" placeholder="admin@example.com" />
              <PasswordInput label="Password" value="Secret123!" onChange={() => undefined} />
              <Button className="w-full">Sign in</Button>
            </div>
          </AuthLayout>
        </div>
      </LayoutsShell>
    );
  }

  if (kind === "public") {
    return (
      <LayoutsShell title="Public Layout Page" description="Contoh public layout dalam frame dashboard.">
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <PublicLayout>
            <section className="space-y-4 py-8">
              <Badge>Public Page</Badge>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Build faster with reusable UI</h2>
              <p className="max-w-2xl text-slate-600 dark:text-slate-300">Template public page untuk company profile, landing sederhana, atau help center.</p>
              <Button>Get Started</Button>
            </section>
          </PublicLayout>
        </div>
      </LayoutsShell>
    );
  }

  return (
    <LayoutsShell title="Layouts" description="Kumpulan halaman layout app.">
      <TemplateMetrics />
      <LinkGrid items={layoutCards} />
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card title="Dashboard Composition" description="Struktur layout admin panel.">
          <div className="grid gap-3">
            {[
              { label: "Sidebar", description: "Navigation utama dan nested menu." },
              { label: "Header", description: "Search, theme switch, notification, user menu." },
              { label: "Main", description: "Grid content untuk cards, charts, forms, dan tables." },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.label}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </Card>
        <Chart
          title="Layout Usage"
          description="Distribusi pemakaian layout dalam app template."
          type="bar"
          height={250}
          series={dashboardSeries}
          valueFormatter={(value) => `${value}`}
        />
      </section>
    </LayoutsShell>
  );
}
