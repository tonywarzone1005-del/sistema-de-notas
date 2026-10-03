/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottom: '1 solid #ccc',
    paddingBottom: 10,
  },
  logo: { width: 60, height: 60 },
  headerText: { flex: 1, marginLeft: 12 },
  title: { fontSize: 16, fontWeight: 'bold' },
  subtitle: { fontSize: 10, marginTop: 4, color: '#444' },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginTop: 12, marginBottom: 6 },
  infoRow: { flexDirection: 'row', marginBottom: 4 },
  infoLabel: { width: 100, color: '#666' },
  infoValue: { flex: 1 },
  table: { display: 'flex', flexDirection: 'column', marginTop: 8 },
  row: { flexDirection: 'row', borderBottom: '1 solid black' },
  cell: { flex: 1, padding: 5 },
  headerRow: { backgroundColor: '#eee', fontWeight: 'bold' },
  finalBox: {
    marginTop: 16,
    padding: 12,
    border: '2 solid #333',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  finalLabel: { fontSize: 12, fontWeight: 'bold' },
  finalValue: { fontSize: 18, fontWeight: 'bold' },
  nota: { textAlign: 'center' },
});

interface StudentGradesData {
  estudiante: { nombre: string; cedula: string };
  curso: { nombre: string; codigo: string; tramo: number; periodo: string; profesor: string };
  asistencia: number;
  notaFinal: number | null;
  evaluaciones: { nombre: string; porcentaje: number; nota: number | null }[];
}

export function StudentGradesPDF({ data }: { data: StudentGradesData }) {
  const aprobado = data.notaFinal !== null && data.notaFinal >= 10 && data.asistencia >= 75;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={`${process.env.NEXTAUTH_URL}/logo-ubv.png`} style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Constancia de Notas</Text>
            <Text style={styles.subtitle}>Universidad Bolivariana de Venezuela</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Datos del Estudiante</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nombre:</Text>
          <Text style={styles.infoValue}>{data.estudiante.nombre}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cédula:</Text>
          <Text style={styles.infoValue}>{data.estudiante.cedula}</Text>
        </View>

        <Text style={styles.sectionTitle}>Datos del Curso</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Curso:</Text>
          <Text style={styles.infoValue}>{data.curso.nombre} ({data.curso.codigo})</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tramo:</Text>
          <Text style={styles.infoValue}>{data.curso.tramo}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Período:</Text>
          <Text style={styles.infoValue}>{data.curso.periodo}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Profesor:</Text>
          <Text style={styles.infoValue}>{data.curso.profesor}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Asistencia:</Text>
          <Text style={styles.infoValue}>{data.asistencia}%</Text>
        </View>

        <Text style={styles.sectionTitle}>Desglose de Evaluaciones</Text>
        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={styles.cell}>Evaluación</Text>
            <Text style={[styles.cell, styles.nota]}>Porcentaje</Text>
            <Text style={[styles.cell, styles.nota]}>Nota</Text>
          </View>
          {data.evaluaciones.map((ev, i) => (
            <View style={styles.row} key={i}>
              <Text style={styles.cell}>{ev.nombre}</Text>
              <Text style={[styles.cell, styles.nota]}>{ev.porcentaje}%</Text>
              <Text style={[styles.cell, styles.nota]}>{ev.nota !== null ? ev.nota : '-'}</Text>
            </View>
          ))}
        </View>

        <View style={styles.finalBox}>
          <Text style={styles.finalLabel}>Nota Final</Text>
          <Text style={styles.finalValue}>
            {data.notaFinal !== null ? data.notaFinal.toFixed(2) : 'Pendiente'}
            {aprobado ? ' — Aprobado' : data.notaFinal !== null ? ' — Reprobado' : ''}
          </Text>
        </View>
      </Page>
    </Document>
  );
}