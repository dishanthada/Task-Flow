import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getBoards, createBoard, updateBoard, deleteBoard } from '../api/boardsApi';
import { getErrorMessage } from '../utils/dateUtils';

/**
 * Custom hook to manage boards state and actions.
 */
export const useBoards = (shouldFetch = true) => {
  const [boards, setBoards]   = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBoards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBoards();
      setBoards(res.data.boards);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (shouldFetch) {
      fetchBoards();
    }
  }, [shouldFetch, fetchBoards]);

  const handleCreateBoard = async (data) => {
    try {
      const res = await createBoard(data);
      setBoards((prev) => [res.data.board, ...prev]);
      toast.success('Board created successfully! 📋');
      return { success: true, board: res.data.board };
    } catch (err) {
      toast.error(getErrorMessage(err));
      return { success: false, error: err };
    }
  };

  const handleUpdateBoard = async (boardId, data) => {
    try {
      const res = await updateBoard(boardId, data);
      setBoards((prev) =>
        prev.map((b) => (b._id === boardId ? { ...b, ...res.data.board } : b))
      );
      toast.success('Board updated successfully!');
      return { success: true };
    } catch (err) {
      toast.error(getErrorMessage(err));
      return { success: false, error: err };
    }
  };

  const handleDeleteBoard = async (boardId) => {
    try {
      await deleteBoard(boardId);
      setBoards((prev) => prev.filter((b) => b._id !== boardId));
      toast.success('Board deleted successfully.');
      return { success: true };
    } catch (err) {
      toast.error(getErrorMessage(err));
      return { success: false, error: err };
    }
  };

  return {
    boards,
    loading,
    refreshBoards: fetchBoards,
    createBoard: handleCreateBoard,
    updateBoard: handleUpdateBoard,
    deleteBoard: handleDeleteBoard,
  };
};

export default useBoards;
