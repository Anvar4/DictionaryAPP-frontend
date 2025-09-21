import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'

export default function DictionaryActions({ item, onEdit, onDelete }) {
	const [showMenu, setShowMenu] = useState(false)
	const [showDeleteModal, setShowDeleteModal] = useState(false)

	return (
		<div className='relative inline-block'>
			<Button variant='ghost' onClick={() => setShowMenu(v => !v)}>
				...
			</Button>
			{showMenu && (
				<div className='absolute right-0 top-10 z-20 bg-white border rounded shadow-lg p-2 min-w-[120px] flex flex-col gap-2'>
					<button
						className='flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded text-blue-600'
						onClick={() => {
							setShowMenu(false)
							onEdit(item)
						}}
					>
						<FiEdit2 /> Tahrirlash
					</button>
					<button
						className='flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded text-red-500'
						onClick={() => {
							setShowMenu(false)
							setShowDeleteModal(true)
						}}
					>
						<FiTrash2 /> O‘chirish
					</button>
				</div>
			)}
			{/* O‘chirishni tasdiqlash modali */}
			{showDeleteModal && (
				<div
					className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 overflow-hidden'
					onClick={() => setShowDeleteModal(false)}
				>
					<div
						className='bg-white rounded-xl shadow-lg p-6 w-full max-w-xs relative'
						style={{ maxHeight: '90vh', overflow: 'visible' }}
						onClick={e => e.stopPropagation()}
					>
						<button
							className='absolute top-2 right-3 text-2xl text-gray-400 hover:text-black'
							onClick={() => setShowDeleteModal(false)}
						>
							×
						</button>
						<div className='text-lg font-semibold text-center mb-4'>
							Lug‘atni o‘chirishni tasdiqlaysizmi?
						</div>
						<div className='flex gap-2 mt-4'>
							<Button
								className='w-1/2'
								variant='destructive'
								onClick={() => {
									setShowDeleteModal(false)
									onDelete(item)
								}}
							>
								Ha, o‘chirish
							</Button>
							<Button
								className='w-1/2'
								variant='outline'
								onClick={() => setShowDeleteModal(false)}
							>
								Bekor
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
