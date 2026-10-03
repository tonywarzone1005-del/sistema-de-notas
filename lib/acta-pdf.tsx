/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: '1 solid #ccc',
    paddingBottom: 10,
  },
  logo: { width: 70, height: 70 },
  headerText: { flex: 1, marginLeft: 12, textAlign: 'left' },
  title: { fontSize: 16, fontWeight: 'bold' },
  subtitle: { fontSize: 11, marginTop: 4, color: '#444' },
  table: { display: 'flex', flexDirection: 'column', marginTop: 10 },
  row: { flexDirection: 'row', borderBottom: '1 solid black' },
  cell: { flex: 1, padding: 4 },
  headerRow: { backgroundColor: '#eee', fontWeight: 'bold' },
});

interface ActaData {
  curso: string;
  codigo: string;
  tramo: number;
  periodo: string;
  estudiantes: {
    nombre: string;
    cedula: string;
    asistencia: number;
    notas: { nombre: string; nota: number | null }[];
    notaFinal: number | null;
  }[];
}

export function ActaPDF({ data }: { data: ActaData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={`${process.env.NEXTAUTH_URL}/logo-ubv.png`} style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Acta de Notas</Text>
            <Text style={styles.subtitle}>
              {data.curso} ({data.codigo}) - Tramo {data.tramo} - Período {data.periodo}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={styles.cell}>Estudiante</Text>
            <Text style={styles.cell}>Cédula</Text>
            <Text style={styles.cell}>Asist. (%)</Text>
            {data.estudiantes[0]?.notas.map((n, i) => (
              <Text key={i} style={styles.cell}>{n.nombre}</Text>
            ))}
            <Text style={styles.cell}>Nota Final</Text>
          </View>
          {data.estudiantes.map((est, idx) => (
            <View style={styles.row} key={idx}>
              <Text style={styles.cell}>{est.nombre}</Text>
              <Text style={styles.cell}>{est.cedula}</Text>
              <Text style={styles.cell}>{est.asistencia}%</Text>
              {est.notas.map((n, i) => (
                <Text key={i} style={styles.cell}>{n.nota ?? '-'}</Text>
              ))}
              <Text style={styles.cell}>{est.notaFinal?.toFixed(2) ?? '-'}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}