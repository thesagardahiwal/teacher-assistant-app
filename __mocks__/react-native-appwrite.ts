export const Client = jest.fn().mockImplementation(() => ({
    setEndpoint: jest.fn().mockReturnThis(),
    setProject: jest.fn().mockReturnThis(),
    setPlatform: jest.fn().mockReturnThis(),
}));

export const Account = jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    createEmailSession: jest.fn(),
    get: jest.fn(),
    deleteSession: jest.fn(),
}));

export const Databases = jest.fn().mockImplementation(() => ({
    createDocument: jest.fn(),
    listDocuments: jest.fn(),
    getDocument: jest.fn(),
    updateDocument: jest.fn(),
    deleteDocument: jest.fn(),
}));

export const Storage = jest.fn().mockImplementation(() => ({
    createFile: jest.fn(),
    getFileView: jest.fn(),
    deleteFile: jest.fn(),
}));

export const ID = {
    unique: jest.fn(() => 'unique_id'),
};

export const Query = {
    equal: jest.fn(),
    notEqual: jest.fn(),
    lessThan: jest.fn(),
    lessThanEqual: jest.fn(),
    greaterThan: jest.fn(),
    greaterThanEqual: jest.fn(),
    search: jest.fn(),
    orderDesc: jest.fn(),
    orderAsc: jest.fn(),
    limit: jest.fn(),
    offset: jest.fn(),
    cursorAfter: jest.fn(),
    cursorBefore: jest.fn(),
    select: jest.fn(),
};
