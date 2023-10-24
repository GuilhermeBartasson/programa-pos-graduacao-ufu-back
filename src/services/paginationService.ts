import PaginationObject from "../models/paginationObject";

class PaginationService {

    public static paginate(page: number, size: number, data: any[]): PaginationObject {
        const response: PaginationObject = { page, size, data: [], pageCount: 0 };

        response.pageCount = Math.ceil(data.length / size);

        let start: number = (page - 1) * size;
        let end: number = start + size

        response.data = data.slice(start, end);

        return response;
    }

}

export default PaginationService;