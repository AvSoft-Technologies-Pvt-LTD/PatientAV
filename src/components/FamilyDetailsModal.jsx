import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'

export default function FamilyDetailsModal({ isOpen, onClose, onSave }) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-8 shadow-2xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold text-primary text-center mb-8"
                >
                  Family Health History
                </Dialog.Title>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border-gray-300 focus:ring-secondary focus:border-secondary transition-colors"
                      placeholder="Family member's name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                    <select
                      className="w-full rounded-xl border-gray-300 focus:ring-secondary focus:border-secondary transition-colors"
                    >
                      <option value="">Select relationship</option>
                      <option>Father</option>
                      <option>Mother</option>
                      <option>Brother</option>
                      <option>Sister</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border-gray-300 focus:ring-secondary focus:border-secondary transition-colors"
                      placeholder="Age"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                    <select
                      className="w-full rounded-xl border-gray-300 focus:ring-secondary focus:border-secondary transition-colors"
                    >
                      <option value="">Select blood group</option>
                      <option>A+</option>
                      <option>A-</option>
                      <option>B+</option>
                      <option>B-</option>
                      <option>AB+</option>
                      <option>AB-</option>
                      <option>O+</option>
                      <option>O-</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label>
                    <textarea
                      className="w-full rounded-xl border-gray-300 focus:ring-secondary focus:border-secondary transition-colors"
                      rows="3"
                      placeholder="List any medical conditions..."
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                  <button
                    type="button"
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 transition-colors"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2.5 text-sm font-medium text-primary bg-gradient-to-r from-secondary to-secondary/90 rounded-xl hover:from-secondary/90 hover:to-secondary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 transition-all"
                    onClick={onSave}
                  >
                    Save Changes
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}