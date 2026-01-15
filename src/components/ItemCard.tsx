import { LostFoundItem } from '../types';
import { FaMapMarkerAlt, FaEnvelope, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

interface ItemCardProps {
  item: LostFoundItem;
  onEdit?: (item: LostFoundItem) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: LostFoundItem['status']) => void;
}

export default function ItemCard({ item, onEdit, onDelete, onStatusChange }: ItemCardProps) {
  const isLost = item.type === 'lost';
  const isActive = item.status === 'active';

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${
      isLost ? 'border-red-500' : 'border-green-500'
    } ${!isActive ? 'opacity-75' : ''}`}>
      {/* Header */}
      <div className={`p-4 ${isLost ? 'bg-red-50' : 'bg-green-50'}`}>
        <div className="flex justify-between items-start">
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              isLost 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {isLost ? '🔍 Lost' : '✨ Found'}
            </span>
            {!isActive && (
              <span className="ml-2 inline-block px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                {item.status === 'claimed' ? 'Claimed' : 'Resolved'}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {onStatusChange && isActive && (
              <button
                onClick={() => onStatusChange(item.id, 'claimed')}
                className="text-green-600 hover:text-green-800 p-1"
                title="Mark as claimed"
              >
                <FaCheckCircle />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(item)}
                className="text-blue-600 hover:text-blue-800 p-1"
                title="Edit"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(item.id)}
                className="text-red-600 hover:text-red-800 p-1"
                title="Delete"
              >
                <FaTimesCircle />
              </button>
            )}
          </div>
        </div>
        <h3 className="text-xl font-bold mt-2 text-gray-900">{item.title}</h3>
      </div>

      {/* Image */}
      {item.imageUrl && (
        <div className="w-full h-64 bg-gray-100">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-700 mb-4">{item.description}</p>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-red-500" />
            <span>{item.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaEnvelope className="text-blue-500" />
            <span>{item.contactInfo}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaClock className="text-gray-400" />
            <span>
              {formatDistanceToNow(item.createdAt, { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
