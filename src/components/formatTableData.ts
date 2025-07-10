// src/utils/formatTableData.ts

export function formatGenerateData(generate: any[] = []) {
  // generate: [{ record: {...} }, ...] => [{...}, {...}]
  return generate.map(item => item.record);
}

export function formatEditData(edit: any) {
  // edit: { original_content: string, edit_content: string }
  if (!edit) return [];
  return [
    {
      original_content: edit.original_content,
      edit_content: edit.edit_content,
    }
  ];
}

export function formatDeleteData(del: any) {
  // delete: { original_content: string, delete_content: string }
  if (!del) return [];
  return [
    {
      original_content: del.original_content,
      delete_content: del.delete_content,
    }
  ];
}
