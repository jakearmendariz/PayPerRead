class HTTP_init:
    def __init__(self) -> None:
        self.OK = 200
        self.CREATED = 201
        self.ACCEPTED = 202
        self.NO_CONTENT = 204
        self.PARTIAL_CONTENT = 206
        self.MULTIPLE_CHOICE = 300
        self.MOVED_PERMANENTLY = 301
        self.FOUND = 302
        self.SEE_OTHER = 303
        self.NOT_MODIFIED = 304
        self.BAD_REQUEST = 400
        self.UNAUTHORIZED = 401
        self.FORBIDDEN = 403
        self.NOT_FOUND = 404

HTTP = HTTP_init()