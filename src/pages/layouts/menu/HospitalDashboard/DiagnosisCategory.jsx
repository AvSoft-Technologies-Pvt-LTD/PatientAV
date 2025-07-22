import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DynamicTable from '../../../../components/microcomponents/DynamicTable';
import ReusableModal from '../../../../components/microcomponents/Modal';

// Default data
const defaultCategories = [
  { id: 1, name: 'Cardiovascular', description: 'Heart issues' },
  { id: 2, name: 'Respiratory', description: 'Lung issues' },
  { id: 3, name: 'Neurology', description: 'Brain and nerves' },
];

const defaultSubcategories = [
  { id: 1, categoryId: 1, name: 'Hypertension', code: 'CV001', description: 'High BP' },
  { id: 2, categoryId: 1, name: 'Arrhythmia', code: 'CV002', description: 'Irregular heartbeat' },
  { id: 3, categoryId: 2, name: 'Asthma', code: 'RS001', description: 'Breathing issue' },
  { id: 4, categoryId: 3, name: 'Epilepsy', code: 'NE001', description: 'Seizure disorder' },
  { id: 5, categoryId: 3, name: 'Stroke', code: 'NE002', description: 'Brain stroke' },
];

export default function DiagnosisCategory() {
  const [categories, setCategories] = useState(defaultCategories);
  const [subcategories, setSubcategories] = useState(defaultSubcategories);
  const [modal, setModal] = useState({ open: false, mode: 'add', item: null });

  // Open modal
  const openModal = (mode, item = null) => {
    setModal({ open: true, mode, item });
  };

  // Close modal
  const closeModal = () => {
    setModal({ open: false, mode: 'add', item: null });
  };

  // Fields shown in modal
  const getFields = () => {
    const fields = [
      { name: 'name', label: 'Name' },
      { name: 'description', label: 'Description', type: 'textarea' },
    ];

    // Show code and categoryId fields only for subcategory (or adding)
    if (!modal.item || modal.item.type === 'subcategory') {
      fields.splice(1, 0,
        { name: 'code', label: 'Code' },
        {
          name: 'categoryId',
          label: 'Category',
          type: 'select',
          options: categories.map(c => ({ label: c.name, value: c.id })),
        }
      );
    }

    return fields;
  };

  // Save handler
  const handleSave = (data) => {
    const isEdit = modal.mode === 'edit';
    const isSubcategory = !!data.code;
    const id = modal.item?.rawId || Date.now();

    const newItem = { ...data, id };

    if (isSubcategory) {
      newItem.categoryId = parseInt(data.categoryId); // ensure it's a number

      if (isEdit) {
        setSubcategories(prev => prev.map(s => s.id === id ? newItem : s));
        toast.success('Subcategory updated');
      } else {
        setSubcategories(prev => [...prev, newItem]);
        toast.success('Subcategory added');
      }
    } else {
      if (isEdit) {
        setCategories(prev => prev.map(c => c.id === id ? newItem : c));
        toast.success('Category updated');
      } else {
        setCategories(prev => [...prev, newItem]);
        toast.success('Category added');
      }
    }

    closeModal();
  };

  // Delete handler
  const handleDelete = () => {
    if (modal.item.type === 'category') {
      const used = subcategories.some(s => s.categoryId === modal.item.rawId);
      if (used) {
        toast.error('Cannot delete category with subcategories');
        return;
      }
      setCategories(prev => prev.filter(c => c.id !== modal.item.rawId));
      toast.success('Category deleted');
    } else {
      setSubcategories(prev => prev.filter(s => s.id !== modal.item.rawId));
      toast.success('Subcategory deleted');
    }
    closeModal();
  };

  // Table rows
  const data = [
    ...categories.map(cat => ({
      id: `cat-${cat.id}`,
      rawId: cat.id,
      name: cat.name,
      code: '-',
      description: cat.description,
      category: cat.name,
      type: 'category',
    })),
    ...subcategories.map(sub => {
      const cat = categories.find(c => c.id === sub.categoryId);
      return {
        id: `sub-${sub.id}`,
        rawId: sub.id,
        name: sub.name,
        code: sub.code,
        description: sub.description,
        category: cat ? cat.name : 'Unknown',
        type: 'subcategory',
        categoryId: sub.categoryId,
      };
    })
  ];

  // Category filter for DynamicTable
  const categoryFilter = {
    key: 'category',
    label: 'Category',
    options: categories.map(c => ({ label: c.name, value: c.name }))
  };

  return (
    <div className="pt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="h3-heading">Diagnosis Management</h2>
        <button className="btn btn-primary flex items-center gap-2" onClick={() => openModal('add')}>
          <Plus size={16} /> Add Diagnosis
        </button>
      </div>

      <DynamicTable
        columns={[
          {
            accessor: 'category',
            header: 'Category',
            cell: (row) => row.type === 'category' ? row.name : row.category,
          },
          {
            accessor: 'name',
            header: 'Subcategory',
            cell: (row) => row.type === 'subcategory' ? row.name : '-',
          },
          {
            accessor: 'code',
            header: 'Code',
            cell: (row) => row.type === 'subcategory' ? row.code : '-',
          },
          {
            accessor: 'description',
            header: 'Description',
            cell: (row) => row.description || '-',
          },
          {
            accessor: 'actions',
            header: 'Actions',
            cell: (row) => (
              <div className="flex space-x-2">
                <button onClick={() => openModal('edit', row)} className="edit-btn hover:bg-blue-100 rounded p-1 transition hover:animate-bounce">
                  <FaEdit className="text-[--primary-color]" />
                </button>
                <button onClick={() => openModal('confirmDelete', row)} className="delete-btn  hover:bg-blue-100 rounded p-1 transition hover:animate-bounce">
                  <FaTrash className="text-red-500" />
                </button>
              </div>
            )
          }
        ]}
        data={data}
        filters={[
          {
            key: 'combinedFilter',
            label: 'Category',
            options: categories.map(c => ({ label: c.name, value: c.name }))
          }
        ]}

      />

      <ReusableModal
        isOpen={modal.open}
        onClose={closeModal}
        mode={modal.mode}
        title={
          modal.mode === 'edit' ? 'Edit Diagnosis' :
          modal.mode === 'confirmDelete' ? 'Delete Confirmation' :
          'Add Diagnosis'
        }
        data={modal.item}
        fields={getFields()}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}
