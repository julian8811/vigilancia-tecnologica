import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 50,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
    paddingBottom: 15,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 4,
  },
  recordCard: {
    marginBottom: 14,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  recordTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 3,
  },
  recordMeta: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 4,
  },
  recordAbstract: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#9CA3AF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    padding: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 4,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#2563EB',
  },
  statLabel: {
    fontSize: 8,
    color: '#6B7280',
    marginTop: 2,
  },
})

interface ReportRecord {
  id: string
  title: string
  year?: number | null
  abstract?: string | null
  type: 'article' | 'patent'
  journal?: string | null
  publicationNumber?: string | null
  aiSummary?: string | null
}

interface ReportPDFProps {
  title: string
  projectName: string
  generatedAt: Date
  records: ReportRecord[]
  organizationName?: string
}

export function ReportPDF({ title, projectName, generatedAt, records, organizationName }: ReportPDFProps) {
  const articles = records.filter((r) => r.type === 'article')
  const patents = records.filter((r) => r.type === 'patent')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {organizationName ? `${organizationName} · ` : ''}
            Proyecto: {projectName} · Generado: {generatedAt.toLocaleDateString('es-AR')}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{records.length}</Text>
            <Text style={styles.statLabel}>TOTAL REGISTROS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{articles.length}</Text>
            <Text style={styles.statLabel}>ARTÍCULOS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{patents.length}</Text>
            <Text style={styles.statLabel}>PATENTES</Text>
          </View>
        </View>

        {/* Articles section */}
        {articles.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Artículos Científicos ({articles.length})</Text>
            {articles.slice(0, 20).map((record) => (
              <View key={record.id} style={styles.recordCard}>
                <Text style={styles.recordTitle}>{record.title}</Text>
                <Text style={styles.recordMeta}>
                  {[record.year, record.journal].filter(Boolean).join(' · ')}
                </Text>
                {(record.aiSummary || record.abstract) && (
                  <Text style={styles.recordAbstract}>
                    {(record.aiSummary || record.abstract || '').slice(0, 300)}
                    {(record.aiSummary || record.abstract || '').length > 300 ? '...' : ''}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Patents section */}
        {patents.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Patentes ({patents.length})</Text>
            {patents.slice(0, 20).map((record) => (
              <View key={record.id} style={[styles.recordCard, { borderLeftColor: '#F59E0B' }]}>
                <Text style={styles.recordTitle}>{record.title}</Text>
                <Text style={styles.recordMeta}>
                  {[record.year, record.publicationNumber].filter(Boolean).join(' · ')}
                </Text>
                {record.abstract && (
                  <Text style={styles.recordAbstract}>
                    {record.abstract.slice(0, 250)}
                    {record.abstract.length > 250 ? '...' : ''}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Vigilancia Tecnológica</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
