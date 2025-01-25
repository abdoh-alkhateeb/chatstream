import { useEffect, useState } from "react";

export default function InterestsSection({
  interests,
  handleSave,
  loading,
}: {
  interests: string[];
  handleSave: (interests: string[]) => Promise<void>;
  loading: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [newInterest, setNewInterest] = useState("");
  const [deleting, setDeleting] = useState<{ index: number; value: string } | null>(null);

  const handleAddInterest = async () => {
    if (!newInterest.trim()) return;

    const updatedInterests = [...interests, newInterest.trim()];
    await handleSave(updatedInterests);

    setNewInterest(""); // Clear the input field
    setAdding(false);
  };

  const handleDeleteInterest = async (index: number) => {
    const updatedInterests = interests.filter((_, i) => i !== index);
    // Save asynchronously
    await handleSave(updatedInterests);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2 text-foreground">Interests</label>
      <div className="flex flex-wrap gap-2 mb-4">
        {interests.map((interest, index) => (
          <div key={index} className="flex items-center bg-gray-200 text-gray-800 px-3 py-1 rounded-full">
            <span>{interest}</span>
            <button onClick={() => setDeleting({ index, value: interest })} className="ml-2 text-red-500 hover:text-red-700" disabled={loading}>
              ×
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            disabled={loading}
            className="bg-background text-foreground w-full border rounded-lg px-4 py-2 disabled:opacity-50"
            placeholder="Enter a new interest"
          />
          <button
            onClick={handleAddInterest}
            disabled={loading}
            className="bg-green-600 text-white py-1 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Add
          </button>
          <button
            onClick={() => setAdding(false)}
            disabled={loading}
            className="bg-gray-600 text-white py-1 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          disabled={loading}
          className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Add
        </button>
      )}

      {deleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="mb-4 text-gray-800">
              Are you sure you want to delete the interest <strong>{deleting.value}</strong>?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={async () => {
                  await handleDeleteInterest(deleting.index);
                  setDeleting(null);
                }}
                disabled={loading}
                className="bg-red-600 text-white py-1 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleting(null)}
                disabled={loading}
                className="bg-gray-600 text-white py-1 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
