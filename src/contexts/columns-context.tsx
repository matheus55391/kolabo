"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { Project } from "@/@types/project";

interface ColumnsContextValue {
    columns: Project["columns"];
    addColumn: (column: Project["columns"][0]) => void;
    updateColumn: (columnId: string, name: string) => void;
    removeColumn: (columnId: string) => void;
    setColumns: (columns: Project["columns"]) => void;
}

const ColumnsContext = createContext<ColumnsContextValue | undefined>(undefined);

export function ColumnsProvider({
    children,
    initialColumns,
}: {
    children: ReactNode;
    initialColumns: Project["columns"];
}) {
    const [columns, setColumns] = useState(initialColumns);

    const addColumn = useCallback((column: Project["columns"][0]) => {
        setColumns((prev) => [...prev, column]);
    }, []);

    const updateColumn = useCallback((columnId: string, name: string) => {
        setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, name } : col)));
    }, []);

    const removeColumn = useCallback((columnId: string) => {
        setColumns((prev) => prev.filter((col) => col.id !== columnId));
    }, []);

    return (
        <ColumnsContext.Provider value={{ columns, addColumn, updateColumn, removeColumn, setColumns }}>
            {children}
        </ColumnsContext.Provider>
    );
}

export function useColumns() {
    const context = useContext(ColumnsContext);
    if (!context) {
        throw new Error("useColumns must be used within ColumnsProvider");
    }
    return context;
}
