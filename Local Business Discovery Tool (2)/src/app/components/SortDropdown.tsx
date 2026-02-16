import { ArrowUpDown } from 'lucide-react';

interface SortDropdownProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export default function SortDropdown({ sortBy, onSortChange }: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-5 h-5 text-gray-500" />
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="rating-desc">Highest Rating</option>
        <option value="rating-asc">Lowest Rating</option>
        <option value="reviews-desc">Most Reviews</option>
        <option value="reviews-asc">Least Reviews</option>
        <option value="name-asc">Name (A-Z)</option>
        <option value="name-desc">Name (Z-A)</option>
      </select>
    </div>
  );
}
