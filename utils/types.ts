export interface Responsible {
    id: number;
    name: string;
    surname: string;
}

export interface Severity {
    id: number;
    name: string;
}

export interface Product {
    id: number;
    name: string;
}

export interface Version {
    id: number;
    name: string;
    product: Product;
}

export interface Status {
    id: number;
    name: string;
}

export interface Ticket {
    id: number;
    name: string;
    description: string;
    openDate: string;
    responsible: number;
    version: Version;
    severity: Severity;
    status: Status;
    customer: number;
    time: string;
}

export interface Customer {
    id: number;
    name: string;
    cuit: string;
}
  