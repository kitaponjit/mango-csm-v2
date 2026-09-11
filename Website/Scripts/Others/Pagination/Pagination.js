class Pagination {
    constructor() {
        this.total_item = 0;
        this.skip = 0;
        this.take = 10;
        this.current_page = 1;
    }

    setItemsPerPage(x) {
        this.take = x;
    }

    getItemsPerPage() {
        return this.take || 0;
    }

    setTotalItems(x) {
        this.total_item = x;
    }

    getTotalItems() {
        return this.total_item || 0;
    }

    setCurrentPage(x) {
        this.current_page = x;
    }

    getCurrentPage() {
        return this.current_page;
    }

    getTotalPages() {
        let p = (this.total_item % this.take != 0) ? Math.floor(this.total_item / this.take) + 1 : Math.floor(this.total_item / this.take);
        p = p < 1 ? 1 : p;
        return p;
    }

    skipItems() {
        return ((this.current_page > 0 ? this.current_page : 1) - 1) * this.take;
    }

    getItemNo(index) {
        return (index + (this.getItemsPerPage() * (this.getCurrentPage() - 1)) + 1);
    }

    createPagesArray() {
        let total_pages = this.getTotalPages();
        let outp_arr = [];
        if (total_pages <= 7) {
            for (let i = 1; i <= total_pages; i++) {
                outp_arr.push({ page_no: i, active: i == this.current_page });
            }
        }
        else if (total_pages > 7 && this.current_page <= 4) {
            for (let i = 1; i <= 7; i++) {
                if (i == 7) {
                    //outp_arr.push({ page_no: 0, active: false, icon: null });
                    outp_arr.push({ page_no: total_pages, active: total_pages == this.current_page, icon: null });
                } else {
                    outp_arr.push({ page_no: i, active: i == this.current_page, icon: null });
                }
            }
        }
        else if (total_pages > 7 && this.current_page >= total_pages - 3) {
            for (let i = 1; i <= 7; i++) {
                if (i == 1) {
                    outp_arr.push({ page_no: 1, active: 1 == this.current_page, icon: null });
                    //outp_arr.push({ page_no: 0, active: false, icon: null });
                }
                else {
                    outp_arr.push({ page_no: total_pages - 7 + i, active: (total_pages - 7 + i) == this.current_page, icon: null });
                }
            }
        } else {
            let start = this.current_page - 7 + 4;
            let end = 0;
            for (let i = 1; i <= 7; i++) {
                if (i == 1) {
                    outp_arr.push({ page_no: 1, active: 1 == this.current_page, icon: null });
                    //outp_arr.push({ page_no: 0, active: false, icon: null });
                }
                else if (i == 7) {
                    //outp_arr.push({ page_no: 0, active: false, icon: null });
                    outp_arr.push({ page_no: total_pages, active: total_pages == this.current_page, icon: null });
                } else {
                    outp_arr.push({ page_no: start - 1 + i, active: (start - 1 + i) == this.current_page, icon: null });
                }
            }
        }
        return outp_arr;
    }
}
