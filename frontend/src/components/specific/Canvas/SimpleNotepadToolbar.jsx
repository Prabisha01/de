import React from "react";
import { FaImage, FaMicrophone, FaSave } from "react-icons/fa";

const SimpleNotepadToolbar = ({
  onImageUpload,
  onRecordAudio,
  isRecording,
  onSave,
}) => {
  return (
    <div className="bg-gray-100 p-2 flex gap-2 border-b">

      <button
        onClick={onSave}
        className="p-2 hover:bg-gray-200 rounded ml-auto"
      >
        <FaSave className="inline mr-1" />
        Save
      </button>
    </div>
  );
};

export default SimpleNotepadToolbar;
