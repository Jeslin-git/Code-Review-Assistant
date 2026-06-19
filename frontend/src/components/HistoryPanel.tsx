'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Review {
  id: string;
  templateMode: string;
  createdAt: string;
  summary: string;
  issues: { filePath: string; line?: number; severity: string; description: string; recommendation: string }[];
}

export default function HistoryPanel({ projectId }: { projectId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selected, setSelected] = useState<Review | null>(null);

  useEffect(() => {
    api.get(`/reviews/history/${projectId}`)
      .then(({ data }) => setReviews(data))
      .catch(console.error);
  }, [projectId]);

  if (reviews.length === 0) {
    return <p className="text-gray-600 text-sm text-center mt-8">No reviews yet.</p>;
  }

  return (
    <div className="space-y-2">
      {reviews.map((review) => (
        <div
          key={review.id}
          onClick={() => setSelected(selected?.id === review.id ? null : review)}
          className="bg-gray-800 rounded-xl p-3 border border-gray-700 cursor-pointer hover:border-gray-600 transition"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-blue-400 uppercase">{review.templateMode}</span>
            <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
          {selected?.id === review.id && (
            <div className="mt-2 text-xs text-gray-400">
              <p className="mb-2">{review.summary}</p>
              {review.issues?.slice(0, 3).map((issue, i) => (
                <p key={i} className="text-gray-500">• [{issue.severity}] {issue.description}</p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}