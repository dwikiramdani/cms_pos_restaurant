import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

export default function Branches() {
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => api.get('/branches').then((res) => res.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-japanese-charcoal">Branches</h1>
          <p className="text-gray-500">Manage restaurant locations</p>
        </div>
        <button className="btn-primary">
          Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches?.map((branch: any) => (
          <div key={branch.id} className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-japanese-red rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">{branch.name[0]}</span>
              </div>
              <div>
                <h3 className="font-semibold">{branch.name}</h3>
                <p className="text-sm text-gray-500">{branch.code}</p>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <p>{branch.address}</p>
              <p>{branch.phone}</p>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className={`px-2 py-1 rounded text-xs ${branch.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {branch.isActive ? 'Active' : 'Inactive'}
              </span>
              <button className="text-japanese-red text-sm">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
