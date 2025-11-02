'use client';

import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PDFViewerClientProps {
  fileUrl: string;
}

export default function PDFViewerClient({ fileUrl }: PDFViewerClientProps) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    // Personalizamos el toolbar
    renderToolbar: (Toolbar) => (
      <div className="bg-blue-300 text-white p-2 shadow-md w-full">
        <Toolbar />
      </div>
    ),
  });

  return (
    <Worker workerUrl="/pdf.worker.min.js">
      <div className="h-[80vh] w-full">
        <Viewer fileUrl={fileUrl} plugins={[defaultLayoutPluginInstance]} />
      </div>
    </Worker>
  );
}
