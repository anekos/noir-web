export interface AppError {
  error: {
    code: number
    message: string
  }
}

export function isError(arg: any): arg is AppError {
    return arg.error !== undefined;
}
