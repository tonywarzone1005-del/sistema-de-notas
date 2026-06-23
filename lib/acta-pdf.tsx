import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10 },
  title: { fontSize: 18, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 12, marginBottom: 20, textAlign: 'center' },
  table: { display: 'flex', flexDirection: 'column' },
  row: { flexDirection: 'row', borderBottom: '1 solid black' },
  cell: { flex: 1, padding: 4 },
  header: { backgroundColor: '#eee', fontWeight: 'bold' },
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
        <Text style={styles.title}>Acta de Notas</Text>
        <Text style={styles.subtitle}>{data.curso} ({data.codigo}) - Tramo {data.tramo} - Período {data.periodo}</Text>
        <View style={styles.table}>
          <View style={[styles.row, styles.header]}>
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