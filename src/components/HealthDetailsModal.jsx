import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function HealthDetailsModal({ isOpen, onClose, onSave, currentBloodGroup }) {
  const [bloodGroup, setBloodGroup] = useState(currentBloodGroup)

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
                  Health Information
                </Dialog.Title>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border-gray-300 focus:ring-secondary focus:border-secondary transition-colors"
                      placeholder="175"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border-gray-300 focus:ring-secondary focus:border-secondary transition-colors"
                      placeholder="70"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full rounded-xl border-gray-300 focus:ring-secondary focus:border-secondary transition-colors"
                    >
                      {bloodGroups.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lifestyle</label>
                    <div className="flex gap-4 bg-gray-50 p-4 rounded-xl">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded text-secondary focus:ring-secondary transition-colors" />
                        <span>Smoker</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded text-secondary focus:ring-secondary transition-colors" />
                        <span>Alcohol Consumer</span>
                      </label>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                    <textarea
                      className="w-full rounded-xl border-gray-300 focus:ring-secondary focus:border-secondary transition-colors"
                      rows="2"
                      placeholder="List any allergies..."
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Past Surgeries</label>
                    <textarea
                      className="w-full rounded-xl border-gray-300 focus:ring-secondary focus:border-secondary transition-colors"
                      rows="2"
                      placeholder="List any past surgeries..."
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