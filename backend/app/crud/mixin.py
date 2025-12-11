
from sqlalchemy.inspection import inspect


class SerializerMixin:
    def to_dict(self, include_relationships=False):
        data = {}
        mapper = inspect(self).mapper

        # Columns
        for c in mapper.column_attrs:
            data[c.key] = getattr(self, c.key)

        # Relationships
        if include_relationships:
            for name, relation in mapper.relationships.items():
                value = getattr(self, name)
                if value is None:
                    data[name] = None
                elif relation.uselist:
                    data[name] = [item.to_dict() for item in value]
                else:
                    data[name] = value.to_dict()

            return data
