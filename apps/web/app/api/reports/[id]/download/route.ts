import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { ReportPDF } from '@/lib/reports/pdf'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const report = await prisma.report.findUnique({
    where: { id: params.id },
    include: {
      project: {
        include: {
          strategies: {
            include: {
              searchRuns: {
                where: { status: 'completed' },
                include: {
                  runRecords: {
                    include: {
                      record: {
                        include: {
                          scientificRecord: true,
                          patentRecord: true,
                          aiAnnotations: { where: { annotationType: 'summary' }, take: 1 },
                        },
                      },
                    },
                    take: 50,
                  },
                },
                take: 3,
              },
            },
          },
        },
      },
    },
  })

  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const records = report.project.strategies
    .flatMap((s) => s.searchRuns)
    .flatMap((r) => r.runRecords)
    .map((rr) => ({
      id: rr.record.id,
      title: rr.record.title,
      year: rr.record.year,
      abstract: rr.record.abstract,
      type: rr.record.recordType as 'article' | 'patent',
      journal: rr.record.scientificRecord?.journal,
      publicationNumber: rr.record.patentRecord?.publicationNumber,
      aiSummary: rr.record.aiAnnotations[0]?.content,
    }))

  const pdfBuffer = await renderToBuffer(
    React.createElement(ReportPDF, {
      title: report.name,
      projectName: report.project.name,
      generatedAt: report.createdAt,
      records,
    })
  )

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${report.name.replace(/[^a-z0-9]/gi, '_')}.pdf"`,
    },
  })
}
