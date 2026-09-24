const { ObjectId } = require("mongodb");

class ContactService {
    constructor(client) {
        this.Contact = client.db().collection("contacts");
    }

    // Hàm bổ trợ trích xuất và chuẩn hóa dữ liệu từ client gửi lên
    extractContactData(payload) {
        const contact = {
            name: payload.name,
            email: payload.email,
            address: payload.address,
            phone: payload.phone,
            favorite: payload.favorite,
        };
        // Xóa các trường có giá trị undefined
        Object.keys(contact).forEach(
            (key) => contact[key] === undefined && delete contact[key]
        );
        return contact;
    }

    // 1. Hàm tạo mới liên hệ
    async create(payload) {
        const contact = this.extractContactData(payload);
        const result = await this.Contact.findOneAndUpdate(
            contact,
            { $set: { favorite: contact.favorite === true } },
            { returnDocument: "after", upsert: true }
        );
        return result;
    }

    // 2. Hàm lấy danh sách / lọc theo tên
    async find(filter) {
        const cursor = await this.Contact.find(filter);
        return await cursor.toArray();
    }

    async findByName(name) {
        return await this.find({
            name: { $regex: new RegExp(name), $options: "i" },
        });
    }

    // 3. Hàm tìm kiếm chi tiết theo ID
    async findById(id) {
        return await this.Contact.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    // 4. Hàm cập nhật thông tin
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractContactData(payload);
        const result = await this.Contact.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result; // Hoặc result.value tùy thuộc vào phiên bản thư viện mongodb của bạn
    }

    // 5. Hàm xóa 1 mục liên hệ
    async delete(id) {
        const result = await this.Contact.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    // 6. Hàm lấy các liên hệ yêu thích
    async findFavorite() {
        return await this.find({ favorite: true });
    }

    // 7. Hàm xóa toàn bộ liên hệ
    async deleteAll() {
        const result = await this.Contact.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = ContactService;
