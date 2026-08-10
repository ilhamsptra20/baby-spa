"use client";

import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  PaperAirplaneIcon,
  PlusIcon,
  ShoppingBagIcon,
  SparklesIcon,
  UserCircleIcon,
  UserGroupIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

import { Button, Card } from "@/ui/components/common";
import {
  Chart,
  DataTable,
  EventCalendar,
  type DataTableColumn,
  type EventCalendarEvent,
} from "@/ui/components/data-display";
import { Alert, EmptyState } from "@/ui/components/feedback";
import { CurrencyInput, Input, Select, Textarea } from "@/ui/components/form";
import { PageTitle } from "@/ui/components/typography";
import { DashboardLayout } from "@/ui/layouts/DashboardLayout";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  status: "Active" | "Pending" | "Suspended";
};

type OrderRow = {
  id: string;
  customer: string;
  product: string;
  status: "Paid" | "Pending" | "Refunded";
  total: string;
};

const revenueSeries = [
  {
    name: "Revenue",
    color: "sky" as const,
    data: [
      { label: "Jan", value: 42 },
      { label: "Feb", value: 58 },
      { label: "Mar", value: 47 },
      { label: "Apr", value: 73 },
      { label: "May", value: 66 },
      { label: "Jun", value: 91 },
    ],
  },
  {
    name: "Profit",
    color: "emerald" as const,
    data: [
      { label: "Jan", value: 24 },
      { label: "Feb", value: 31 },
      { label: "Mar", value: 29 },
      { label: "Apr", value: 44 },
      { label: "May", value: 39 },
      { label: "Jun", value: 57 },
    ],
  },
];

const users: UserRow[] = [
  { id: "u-1", name: "Aditya Kusuma", email: "aditya@example.com", role: "Admin", status: "Active" },
  { id: "u-2", name: "Bella Putri", email: "bella@example.com", role: "Editor", status: "Pending" },
  { id: "u-3", name: "Chandra Bayu", email: "chandra@example.com", role: "Viewer", status: "Active" },
  { id: "u-4", name: "Dina Mahesa", email: "dina@example.com", role: "Editor", status: "Suspended" },
  { id: "u-5", name: "Eko Pramana", email: "eko@example.com", role: "Viewer", status: "Active" },
  { id: "u-6", name: "Fiona Laras", email: "fiona@example.com", role: "Admin", status: "Active" },
];

const orders: OrderRow[] = [
  { id: "ORD-1029", customer: "Alya Rahman", product: "Starter Kit", status: "Paid", total: "Rp 2.450.000" },
  { id: "ORD-1030", customer: "Bagas Prasetyo", product: "Team Plan", status: "Pending", total: "Rp 7.800.000" },
  { id: "ORD-1031", customer: "Clara Wijaya", product: "Enterprise", status: "Paid", total: "Rp 18.250.000" },
  { id: "ORD-1032", customer: "Dimas Saputra", product: "Add-on Seat", status: "Refunded", total: "Rp 950.000" },
  { id: "ORD-1033", customer: "Eka Pratama", product: "Professional", status: "Paid", total: "Rp 5.400.000" },
  { id: "ORD-1034", customer: "Farah Anindya", product: "Team Plan", status: "Pending", total: "Rp 7.800.000" },
];

const userColumns: DataTableColumn<UserRow>[] = [
  { key: "name", header: "Name", sortable: true, render: (row) => <span className="font-medium text-slate-900 dark:text-slate-100">{row.name}</span> },
  { key: "email", header: "Email", sortable: true },
  {
    key: "role",
    header: "Role",
    sortable: true,
    render: (row) => <Badge>{row.role}</Badge>,
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (row) => <StatusBadge status={row.status} />,
  },
];

const orderColumns: DataTableColumn<OrderRow>[] = [
  { key: "id", header: "Order", sortable: true, render: (row) => <span className="font-medium text-slate-900 dark:text-slate-100">{row.id}</span> },
  { key: "customer", header: "Customer", sortable: true },
  { key: "product", header: "Product" },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (row) => <StatusBadge status={row.status} />,
  },
  { key: "total", header: "Total", sortable: true, className: "text-right font-medium" },
];

function Badge({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: UserRow["status"] | OrderRow["status"] }) {
  const tone = {
    Active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    Paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    Pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    Suspended: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    Refunded: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  }[status];

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}

function StatCard({
  title,
  value,
  trend,
  trendUp = true,
  icon: Icon,
}: {
  title: string;
  value: string;
  trend: string;
  trendUp?: boolean;
  icon: IconComponent;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
          <span
            className={
              trendUp
                ? "mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                : "mt-3 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
            }
          >
            {trendUp ? <ArrowTrendingUpIcon className="h-3.5 w-3.5" /> : <ArrowTrendingDownIcon className="h-3.5 w-3.5" />}
            {trend}
          </span>
        </div>
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300">
          <Icon className="h-6 w-6" />
        </span>
      </div>
    </Card>
  );
}

function KpiGrid() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Customers" value="3,782" trend="+11.2%" icon={UserGroupIcon} />
      <StatCard title="Orders" value="5,359" trend="+8.4%" icon={ShoppingBagIcon} />
      <StatCard title="Monthly Sales" value="Rp 284.6M" trend="+14.8%" icon={WalletIcon} />
      <StatCard title="Open Tickets" value="42" trend="-6.1%" trendUp={false} icon={ChatBubbleLeftRightIcon} />
    </section>
  );
}

function RecentUsersTable() {
  return (
    <DataTable<UserRow>
      data={users}
      columns={userColumns}
      searchable
      searchKeys={["name", "email", "role", "status"]}
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
  );
}

function OrdersTable() {
  return (
    <DataTable<OrderRow>
      data={orders}
      columns={orderColumns}
      searchable
      searchKeys={["id", "customer", "product", "status"]}
      filters={[
        {
          key: "status",
          label: "Status",
          options: [
            { label: "Paid", value: "Paid" },
            { label: "Pending", value: "Pending" },
            { label: "Refunded", value: "Refunded" },
          ],
        },
      ]}
      paginated
      pageSize={3}
    />
  );
}

function DashboardPageTitle({ title, description }: { title: string; description: string }) {
  return <PageTitle title={title} description={description} />;
}

export function OverviewTemplate() {
  return (
    <DashboardLayout title="Dashboard" subtitle="Template dashboard memakai komponen UI" headerActions={<Button size="sm">Export Report</Button>}>
      <div className="space-y-6">
        <DashboardPageTitle title="Dashboard Overview" description="Ringkasan operasional, revenue, aktivitas, dan user terbaru." />
        <KpiGrid />
        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Chart
            title="Revenue Overview"
            description="Revenue dan profit 6 bulan terakhir."
            series={revenueSeries}
            type="area"
            height={300}
            valueFormatter={(value) => `${value}M`}
          />
          <Card title="Today Focus" description="Checklist prioritas operasional.">
            <div className="space-y-3">
              {["Review pending invoice", "Approve 8 new users", "Publish weekly report", "Resolve support backlog"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950/60">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
        <Card title="Recent Users" description="Contoh DataTable dengan search, filter, sorting, dan pagination." contentClassName="p-0">
          <RecentUsersTable />
        </Card>
      </div>
    </DashboardLayout>
  );
}

export function EcommerceTemplate() {
  return (
    <DashboardLayout title="E-commerce" subtitle="Sales, orders, dan product performance" headerActions={<Button size="sm"><PlusIcon className="h-4 w-4" />New Order</Button>}>
      <div className="space-y-6">
        <DashboardPageTitle title="E-commerce Template" description="Template halaman commerce memakai KPI, chart, dan order table." />
        <KpiGrid />
        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Chart title="Order Trend" description="Jumlah transaksi mingguan." series={revenueSeries} type="bar" height={280} valueFormatter={(value) => `${value}`} />
          <Chart title="Channel Split" description="Kontribusi channel order." type="pie" height={280} data={[
            { label: "Marketplace", value: 44 },
            { label: "Website", value: 31 },
            { label: "Reseller", value: 18 },
            { label: "Retail", value: 7 },
          ]} valueFormatter={(value) => `${value}%`} />
        </section>
        <Card title="Latest Orders" description="DataTable order dengan filter status." contentClassName="p-0">
          <OrdersTable />
        </Card>
      </div>
    </DashboardLayout>
  );
}

export function CalendarTemplate() {
  const events: EventCalendarEvent[] = [
    {
      id: "event-1",
      title: "Seminar #4",
      date: "2026-08-09",
      time: "09:00",
      type: "conference",
      description: "Customer education webinar.",
    },
    {
      id: "event-2",
      title: "4p Meeting #!",
      date: "2026-08-09",
      time: "16:00",
      type: "meeting",
      description: "Team sync and delivery check.",
    },
    {
      id: "event-3",
      title: "Event Conf.",
      date: "2026-08-01",
      time: "10:00",
      type: "deadline",
      description: "Conference opening event.",
    },
    {
      id: "event-4",
      title: "Seminar #4",
      date: "2026-08-07",
      time: "09:30",
      type: "conference",
      description: "Partner session.",
    },
    {
      id: "event-5",
      title: "Seminar #6",
      date: "2026-08-11",
      time: "11:00",
      type: "deadline",
      description: "Public training session.",
    },
    {
      id: "event-6",
      title: "10:30a Meeting",
      date: "2026-08-12",
      time: "10:30",
      type: "conference",
      description: "Planning and stakeholder sync.",
    },
    {
      id: "event-7",
      title: "12p Meetup #",
      date: "2026-08-12",
      time: "12:00",
      type: "meeting",
      description: "Community meetup.",
    },
    {
      id: "event-8",
      title: "2:30p Submiss",
      date: "2026-08-12",
      time: "14:30",
      type: "reminder",
      description: "Submission reminder.",
    },
    {
      id: "event-9",
      title: "7a Attend eve",
      date: "2026-08-13",
      time: "07:00",
      type: "conference",
      description: "Attendance checkpoint.",
    },
  ];

  return (
    <DashboardLayout title="Calendar" subtitle="Schedule and planning template">
      <div className="space-y-6">
        <DashboardPageTitle title="Calendar" description="Full calendar page dengan month grid, event chips, dan kontrol view seperti admin template." />

        <EventCalendar
          defaultEvents={events}
          defaultValue="2026-08-09"
          defaultMonth="2026-08"
        />
      </div>
    </DashboardLayout>
  );
}

export function ProfileTemplate() {
  return (
    <DashboardLayout title="User Profile" subtitle="Profile and account template" headerActions={<Button size="sm">Save Changes</Button>}>
      <div className="space-y-6">
        <DashboardPageTitle title="Profile Template" description="Template profil memakai form components dan summary card." />
        <section className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <Card>
            <div className="flex flex-col items-center text-center">
              <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300">
                <UserCircleIcon className="h-12 w-12" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Nadia Puspita</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Product Manager</p>
              <Button className="mt-4" variant="outline">Upload Avatar</Button>
            </div>
          </Card>
          <Card title="Account Details" description="Form template untuk update data user.">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Full name" defaultValue="Nadia Puspita" />
              <Input label="Email" type="email" defaultValue="nadia@example.com" />
              <Input label="Role" defaultValue="Product Manager" />
              <Input label="Phone" defaultValue="+62 812 0000 1999" />
              <Textarea label="Bio" defaultValue="Mengelola product roadmap dan operational dashboard." containerClassName="md:col-span-2" />
            </div>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}

export function TaskTemplate() {
  const tasks = [
    { title: "Audit dashboard components", status: "Active" },
    { title: "Review payment edge cases", status: "Pending" },
    { title: "Ship docs data table example", status: "Active" },
    { title: "Clean invoice workflow", status: "Suspended" },
  ] as const;

  return (
    <DashboardLayout title="Task" subtitle="Task management template" headerActions={<Button size="sm"><PlusIcon className="h-4 w-4" />New Task</Button>}>
      <div className="space-y-6">
        <DashboardPageTitle title="Task Template" description="Template task board sederhana memakai Card, StatusBadge, dan EmptyState." />
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {tasks.map((task) => (
            <Card key={task.title}>
              <div className="space-y-3">
                <StatusBadge status={task.status} />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{task.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Owner, deadline, dan progress bisa disambungkan ke API.</p>
              </div>
            </Card>
          ))}
        </section>
        <EmptyState title="No blocked task" description="Gunakan empty state ini untuk kondisi list kosong." action={<Button variant="outline">Create Task</Button>} />
      </div>
    </DashboardLayout>
  );
}

export function ChatTemplate() {
  const messages = [
    { name: "Support", body: "Invoice sudah dicek, tinggal approve finance." },
    { name: "Ops", body: "Deployment window aman untuk malam ini." },
    { name: "Product", body: "Mohon review perubahan DataTable filter." },
  ];

  return (
    <DashboardLayout title="Chat" subtitle="Team conversation template" headerActions={<Button size="sm"><PaperAirplaneIcon className="h-4 w-4" />Send</Button>}>
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card title="Inbox" description="Conversation list.">
          <div className="space-y-2">
            {messages.map((message) => (
              <button key={message.name} type="button" className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-left transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:bg-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{message.name}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{message.body}</p>
              </button>
            ))}
          </div>
        </Card>
        <Card title="Conversation" description="Area chat memakai Textarea dan action button.">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.body} className="rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-950/60">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{message.name}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{message.body}</p>
              </div>
            ))}
            <Textarea label="Reply" placeholder="Tulis balasan..." />
            <Button>Send Reply</Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export function EmailTemplate() {
  return (
    <DashboardLayout title="Email" subtitle="Email workflow template" headerActions={<Button size="sm"><EnvelopeIcon className="h-4 w-4" />Compose</Button>}>
      <div className="space-y-6">
        <DashboardPageTitle title="Email Template" description="Template inbox dan compose form memakai komponen form yang ada." />
        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card title="Inbox" description="Email terbaru.">
            <div className="space-y-3">
              {["Payment confirmation", "Weekly report", "New user invite", "Support escalation"].map((subject) => (
                <div key={subject} className="rounded-lg border border-slate-100 px-4 py-3 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{subject}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">admin@example.com</p>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Compose" description="Form email template.">
            <div className="space-y-4">
              <Input label="To" placeholder="team@example.com" />
              <Input label="Subject" placeholder="Monthly report" />
              <Textarea label="Message" placeholder="Tulis pesan..." />
              <Button>Send Email</Button>
            </div>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}

export function InvoiceTemplate() {
  return (
    <DashboardLayout title="Invoice" subtitle="Billing and invoice template" headerActions={<Button size="sm">Download PDF</Button>}>
      <div className="space-y-6">
        <DashboardPageTitle title="Invoice Template" description="Template invoice memakai CurrencyInput, Card, Alert, dan DataTable." />
        <Alert tone="success" title="Invoice ready" description="Gunakan template ini untuk halaman detail invoice atau billing." />
        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <Card title="Invoice Items" description="Daftar item tagihan." contentClassName="p-0">
            <OrdersTable />
          </Card>
          <Card title="Payment Summary" description="Input nominal dan status pembayaran.">
            <div className="space-y-4">
              <CurrencyInput label="Subtotal" value="28400000" disabled />
              <CurrencyInput label="Tax" value="3124000" disabled />
              <CurrencyInput label="Grand Total" value="31524000" disabled />
              <Select label="Payment status" value="paid" options={[
                { label: "Paid", value: "paid" },
                { label: "Pending", value: "pending" },
                { label: "Overdue", value: "overdue" },
              ]} />
              <Button className="w-full">Mark as Paid</Button>
            </div>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}

export function AiAssistantTemplate() {
  return (
    <DashboardLayout title="AI Assistant" subtitle="Assistant workspace template" headerActions={<Button size="sm"><SparklesIcon className="h-4 w-4" />New Prompt</Button>}>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card title="Prompt Console" description="Template form untuk fitur AI assistant.">
          <div className="space-y-4">
            <Textarea label="Prompt" placeholder="Ringkas performa penjualan minggu ini..." />
            <Select label="Output format" value="summary" options={[
              { label: "Summary", value: "summary" },
              { label: "Action items", value: "actions" },
              { label: "Email draft", value: "email" },
            ]} />
            <Button><SparklesIcon className="h-4 w-4" />Generate</Button>
          </div>
        </Card>
        <Card title="Usage" description="Monitoring pemakaian assistant.">
          <div className="grid gap-3">
            {[
              { label: "Prompts", value: "1,248", helper: "+18% dari minggu lalu" },
              { label: "Cost", value: "Rp 2.1M", helper: "-3.2% dari minggu lalu" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">{item.value}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.helper}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
