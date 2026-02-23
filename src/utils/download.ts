
/**
 * Utility to trigger a browser download of a string or blob.
 */
export const downloadFile = (content: string | Blob, fileName: string, contentType: string = 'text/plain') => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Converts an array of objects to a CSV string.
 */
export const convertToCSV = (data: any[]) => {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => 
    headers.map(header => {
      const val = obj[header];
      return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
};
