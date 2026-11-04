import type { AnalyticsData, DashboardStats } from "../types/api"

type Rgb = [number, number, number]

const BRAND: Rgb = [124, 92, 255]

export async function downloadReport(
  stats: DashboardStats,
  data: AnalyticsData,
) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ])
  const autoTable = autoTableModule.default

  const doc = new jsPDF({ unit: "pt", format: "a4" })
  const today = new Date()
  const finalY = () =>
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY

  doc.setFillColor(...BRAND)
  doc.rect(0, 0, 595, 78, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.text("StudyLink LK", 40, 42)
  doc.setFontSize(11)
  doc.text("Platform report", 40, 62)
  doc.text(
    today.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    555,
    62,
    { align: "right" },
  )

  doc.setTextColor(20, 22, 58)
  doc.setFontSize(14)
  doc.text("Summary", 40, 110)

  autoTable(doc, {
    startY: 120,
    head: [["Measure", "Value"]],
    body: [
      ["Registered students", String(stats.students)],
      ["Active listings", String(stats.activeListings)],
      ["Listings waiting for review", String(stats.pendingListings)],
      ["Books sold", String(stats.booksSold)],
      ["Open reports", String(stats.openReports)],
      [
        "Average price of active books",
        `Rs. ${data.kpis.averagePrice.toLocaleString("en-US")}`,
      ],
      ["Free books available", String(data.kpis.freeBooks)],
      ["Listings written with AI help", `${data.kpis.aiShare}%`],
      ["Sales confirmed by the buyer", `${data.kpis.verifiedShare}%`],
    ],
    headStyles: { fillColor: BRAND },
    styles: { fontSize: 10 },
  })

  doc.setFontSize(14)
  doc.text("Last 6 months", 40, finalY() + 32)
  autoTable(doc, {
    startY: finalY() + 42,
    head: [["Month", "New listings", "Books sold"]],
    body: data.months.map((month) => [
      month.label,
      String(month.listings),
      String(month.sold),
    ]),
    headStyles: { fillColor: BRAND },
    styles: { fontSize: 10 },
  })

  doc.setFontSize(14)
  doc.text("Subjects: books available and requests", 40, finalY() + 32)
  autoTable(doc, {
    startY: finalY() + 42,
    head: [["Subject", "Books available", "Requests"]],
    body: data.subjects.map((subject) => [
      subject.name,
      String(subject.supply),
      String(subject.demand),
    ]),
    headStyles: { fillColor: BRAND },
    styles: { fontSize: 10 },
  })

  doc.setFontSize(14)
  doc.text("Top districts", 40, finalY() + 32)
  autoTable(doc, {
    startY: finalY() + 42,
    head: [["District", "Books"]],
    body: data.districts.length
      ? data.districts.map((district) => [
          district.name,
          String(district.count),
        ])
      : [["No data yet", "-"]],
    headStyles: { fillColor: BRAND },
    styles: { fontSize: 10 },
  })

  doc.setFontSize(14)
  doc.text("Requests by status", 40, finalY() + 32)
  autoTable(doc, {
    startY: finalY() + 42,
    head: [["Status", "Requests"]],
    body: data.requestStatus.length
      ? data.requestStatus.map((row) => [row.status, String(row.count)])
      : [["No requests yet", "-"]],
    headStyles: { fillColor: BRAND },
    styles: { fontSize: 10 },
  })

  const pages = doc.getNumberOfPages()

  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page)
    doc.setFontSize(9)
    doc.setTextColor(120, 124, 160)
    doc.text(
      `StudyLink LK platform report  |  Page ${page} of ${pages}`,
      297,
      820,
      { align: "center" },
    )
  }

  doc.save(`studylink-report-${today.toISOString().slice(0, 10)}.pdf`)
}
