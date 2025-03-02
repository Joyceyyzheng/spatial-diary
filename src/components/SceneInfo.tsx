import React from "react";

interface SceneInfoProps {
  sceneId: string;
  onClose: () => void;
}

const SceneInfo: React.FC<SceneInfoProps> = ({ sceneId, onClose }) => {
  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Scene Info</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div>创建时间：{new Date(parseInt(sceneId)).toLocaleString()}</div>
      </div>
    </div>
  );
};

export default SceneInfo;
