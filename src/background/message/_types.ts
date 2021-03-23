// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FuncType = (...args: any) => any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ArgumentTypes<T> = T extends (...args: infer U) => any ? U : never
type ReturnExcludePromiseType<T extends FuncType> = ReturnType<T> extends Promise<infer U> ? U : ReturnType<T>

type messageTypeType<T extends string> = {
  type: `${T}`
}

type messageDataObjectType<R> = {
  [P in {[K in keyof R]: R[K] extends FuncType ? K : never}[keyof R]]: {
    type: P,
    params: ArgumentTypes<R[P]>[0],
    response: ReturnExcludePromiseType<R[P]>
  }
}

type messageDataUnionType<R> = messageDataObjectType<R>[keyof messageDataObjectType<R>]

/*
  Create parameters type to communicate packets between the background task and the other task.

  Generics types:
  * R: RepositoryType

  If you create MutationsType as a input is:
    ```
    interface RepositoryType {
      put (payload: { id: number, value: string }): Promise<void>
      delete (payload: { id: number }): Promise<void>
    }
    ```
  the output type is:
    ```
    type messageDataType = messageDataType<RepositoryType> = {
      type: "put";
      params: {
        id: number;
        value: string;
      };
      response: void;
    } | {
      type: "delete";
      params: {
        id: number;
      };
      response: void;
    }
    ```
*/
export type messageDataType<R> = messageDataUnionType<R>

type messageDataWrapperType<T, R> = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  [P in T]: messageDataType<R>
}

/*
  Create parameters type to communicate packets between the background task and the other task.

  Generics types:
  * T: Module name
  * R: RepositoryType

  If you create MutationsType as a input is:
    ```
    interface RepositoryType {
      put (payload: { id: number, value: string }): Promise<void>
      delete (payload: { id: number }): Promise<void>
    }
    ```
  the output type is:
    ```
    type messageDataType = messageDataType<'boo', RepositoryType> = {
      type: 'boo',
      boo: {
             type: "put";
             params: {
               id: number;
               value: string;
             };
             response: void;
           } | {
             type: "delete";
             params: {
               id: number;
             };
             response: void;
           }
    }
    ```
*/
export type messageType<T extends string, R> = messageTypeType<T> & messageDataWrapperType<T, R>